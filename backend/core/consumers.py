import json
from channels.generic.websocket import AsyncJsonWebsocketConsumer
from rest_framework_simplejwt.authentication import JWTAuthentication
from channels.db import database_sync_to_async


class FarmerOrdersConsumer(AsyncJsonWebsocketConsumer):
    async def connect(self):
        await self.accept()
        self.user = None

    async def receive_json(self, content, **kwargs):
        # Expect an auth message with token initially: {type: 'auth', token: '...'}
        t = content.get('type')
        if t == 'auth':
            token = content.get('token')
            if not token:
                await self.close(code=4001)
                return

            user = await self._authenticate_token(token)
            if not user:
                await self.close(code=4003)
                return

            self.user = user
            self.group_name = f'farmer_{self.user.id}'
            await self.channel_layer.group_add(self.group_name, self.channel_name)
            await self.send_json({'type': 'auth:ok'})

    async def disconnect(self, code):
        if getattr(self, 'group_name', None):
            await self.channel_layer.group_discard(self.group_name, self.channel_name)

    async def order_update(self, event):
        # Forward order update to websocket client
        await self.send_json({'type': 'order.update', 'order_id': event.get('order_id'), 'action': event.get('action', 'updated')})

    @database_sync_to_async
    def _authenticate_token(self, token):
        try:
            auth = JWTAuthentication()
            validated = auth.get_validated_token(token)
            user = auth.get_user(validated)
            return user
        except Exception:
            return None
