import { formatINR } from "../../utils/currency";

const PurchasedItems = ({ order }) => {
  const items = order?.items || [];

  return (
    <div className="bg-white rounded-4xl border border-gray-200 p-10 shadow-sm">

      {/* Header */}
      <div className="flex justify-between items-center border-b border-gray-100 pb-8 mb-8">

        <div>
          
          <p className="text-sm text-gray-400 uppercase tracking-wider">
            Order Number
          </p>

          <h2 className="text-4xl font-bold text-[#012d1d] mt-2">
            {order?.orderNumber || "NK-00000000"}
          </h2>
        </div>

        <div className="text-right">
          
          <p className="text-sm text-gray-400 uppercase tracking-wider">
            Estimated Delivery
          </p>

          <h2 className="text-3xl font-bold text-[#1f6d1a] mt-2">
            3-5 business days
          </h2>
        </div>
      </div>

      <h3 className="text-4xl font-bold text-[#012d1d] mb-10">
        Items Purchased
      </h3>

      <div className="space-y-6">

        {items.map((item, index) => (
          <div
            key={index}
            className="flex items-center gap-6 p-4 rounded-2xl hover:bg-[#f8f8f8] transition"
          >

            <img
              src={item.image}
              alt=""
              className="w-24 h-24 rounded-2xl object-cover"
            />

            <div className="flex-1">
              
              <h4 className="text-2xl font-bold text-[#012d1d]">
                {item.title}
              </h4>

              <p className="text-gray-500 mt-2">
                {item.quantity} {item.unit} • {item.farmerName}
              </p>
            </div>

            <h3 className="text-2xl font-bold text-[#012d1d]">
              {formatINR(item.lineTotal)}
            </h3>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PurchasedItems;