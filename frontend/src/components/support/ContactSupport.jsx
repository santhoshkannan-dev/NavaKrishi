import {
  FiMessageSquare,
  FiMail,
  FiUsers,
} from "react-icons/fi";
import { Link } from "react-router-dom";

const cards = [
  {
    title: "Live Chat",
    icon: <FiMessageSquare />,
    button: "Start Chat",
    href: "/support",
    external: false,
  },

  {
    title: "Email Support",
    icon: <FiMail />,
    button: "Send Email",
    href: "mailto:support@navakrishi.com",
    external: true,
  },

  {
    title: "Community Forum",
    icon: <FiUsers />,
    button: "Visit Community",
    href: "/impact",
    external: false,
  },
];

const ContactSupport = () => {
  return (
    <section className="bg-[#f5f5f5] py-24 px-6">

      <div className="max-w-360 mx-auto">

        <div className="text-center mb-20">
          
          <h2 className="text-6xl font-bold text-[#012d1d]">
            Still have questions?
          </h2>

          <p className="text-gray-500 mt-5 text-xl">
            Our support team is rooted in the same soil as your crops.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">

          {cards.map((card, index) => (
            <div
              key={index}
              className="bg-white rounded-3xl border border-gray-200 p-10 text-center shadow-sm"
            >
              <div className="w-20 h-20 rounded-full bg-[#f0ffe9] flex items-center justify-center mx-auto text-[#1f6d1a] text-4xl">
                {card.icon}
              </div>

              <h3 className="text-3xl font-bold text-[#012d1d] mt-8">
                {card.title}
              </h3>

              {card.external ? (
                <a
                  href={card.href}
                  className="mt-10 inline-flex w-full justify-center rounded-2xl border border-[#1f6d1a] py-4 text-[#1f6d1a] transition hover:bg-[#1f6d1a] hover:text-white"
                >
                  {card.button}
                </a>
              ) : (
                <Link
                  to={card.href}
                  className="mt-10 inline-flex w-full justify-center rounded-2xl border border-[#1f6d1a] py-4 text-[#1f6d1a] transition hover:bg-[#1f6d1a] hover:text-white"
                >
                  {card.button}
                </Link>
              )}
            </div>
          ))}
        </div>

        <div className="mt-10 rounded-3xl border border-[#d9ead2] bg-[#f6fff3] px-6 py-5 text-[#174f16]">
          Average support response time is under 2 hours on business days.
        </div>
      </div>
    </section>
  );
};

export default ContactSupport;