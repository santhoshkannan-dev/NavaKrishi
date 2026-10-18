import { FiCheckCircle } from "react-icons/fi";

const SuccessHero = ({ order }) => {
  return (
    <section className="text-center">

      <div className="w-28 h-28 rounded-full bg-[#a4f792] flex items-center justify-center mx-auto shadow-xl border-8 border-white">

        <FiCheckCircle className="text-[#1f6d1a] text-6xl" />
      </div>

      <h1 className="text-6xl font-bold text-[#012d1d] mt-10">
        Thank you for your order!
      </h1>

      {order?.orderNumber && (
        <p className="mt-4 text-sm uppercase tracking-[0.3em] text-[#1f6d1a] font-semibold">
          Order {order.orderNumber}
        </p>
      )}

      <p className="text-gray-500 text-xl mt-6 max-w-3xl mx-auto leading-relaxed">
        Your payment was successful and your invoice is ready below.
      </p>
    </section>
  );
};

export default SuccessHero;