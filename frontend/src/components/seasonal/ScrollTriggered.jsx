import * as motion from "motion/react-client";

export default function ScrollTriggered() {
    return (
        <section className="flex flex-col items-center justify-center py-16">
            <div className="text-center max-w-2xl mb-8 px-4">
                <span className="bg-[#dff5d8] text-[#1f6d1a] px-5 py-2 rounded-full text-sm font-semibold">
                    Harvest Colors
                </span>
                <h2 className="text-4xl md:text-5xl font-bold text-[#012d1d] mt-6 leading-tight">
                    Taste the Palette of the Season
                </h2>
                <p className="text-gray-500 mt-4 text-lg">
                    Each variety is harvested at peak ripeness, bringing a burst of nutrition and natural color to your table. Scroll to explore the spectrum of freshness.
                </p>
            </div>

            <div style={container}>
                {food.map(([name, imageUrl, hueA, hueB], i) => (
                    <Card i={i} name={name} imageUrl={imageUrl} hueA={hueA} hueB={hueB} key={name} />
                ))}
            </div>
        </section>
    );
}

function Card({ name, imageUrl, hueA, hueB, i }) {
    const background = `linear-gradient(306deg, ${hue(hueA)}, ${hue(hueB)})`;

    return (
        <motion.div
            className={`card-container-${i}`}
            style={cardContainer}
            initial="offscreen"
            whileInView="onscreen"
            viewport={{ amount: 0.8 }}
        >
            <div style={{ ...splash, background }} />
            <motion.div style={card} variants={cardVariants} className="card flex flex-col p-4 bg-white overflow-hidden">
                <img src={imageUrl} alt={name} className="w-full h-72 object-cover rounded-xl" />
                <div className="flex-1 flex items-center justify-center font-bold text-2xl text-[#012d1d] mt-3">
                    {name}
                </div>
            </motion.div>
        </motion.div>
    );
}

const cardVariants = {
    offscreen: {
        y: 300,
    },
    onscreen: {
        y: 50,
        rotate: -10,
        transition: {
            type: "spring",
            bounce: 0.4,
            duration: 0.8,
        },
    },
};

const hue = (h) => `hsl(${h}, 100%, 50%)`;

/**
 * ==============   Styles   ================
 */

const container = {
    margin: "100px auto",
    maxWidth: 500,
    paddingBottom: 100,
    width: "100%",
};

const cardContainer = {
    overflow: "hidden",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    paddingTop: 20,
    marginBottom: -120,
};

const splash = {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    clipPath: `path("M 0 303.5 C 0 292.454 8.995 285.101 20 283.5 L 460 219.5 C 470.085 218.033 480 228.454 480 239.5 L 500 430 C 500 441.046 491.046 450 480 450 L 20 450 C 8.954 450 0 441.046 0 430 Z")`,
};

const card = {
    width: 300,
    height: 430,
    borderRadius: 20,
    background: "#ffffff",
    boxShadow:
        "0 0 1px hsl(0deg 0% 0% / 0.075), 0 0 2px hsl(0deg 0% 0% / 0.075), 0 0 4px hsl(0deg 0% 0% / 0.075), 0 0 8px hsl(0deg 0% 0% / 0.075), 0 0 16px hsl(0deg 0% 0% / 0.075)",
    transformOrigin: "10% 60%",
};

/**
 * ==============   Data   ================
 */

const food = [
    ["Tomato", "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&q=80&w=400", 340, 10],
    ["Orange", "https://images.unsplash.com/photo-1547514701-42782101795e?auto=format&fit=crop&q=80&w=400", 20, 40],
    ["Lemon", "https://images.unsplash.com/photo-1590502593747-42a996133562?auto=format&fit=crop&q=80&w=400", 60, 90],
    ["Pear", "https://images.unsplash.com/photo-1514756331096-242fdeb70d4a?auto=format&fit=crop&q=80&w=400", 80, 120],
    ["Green Apple", "https://images.unsplash.com/photo-1619546813926-a78fa6372cd2?auto=format&fit=crop&q=80&w=400", 100, 140],
    ["Blueberry", "https://images.unsplash.com/photo-1601004890684-d8cbf643f5f2?auto=format&fit=crop&q=80&w=400", 205, 245],
    ["Eggplant", "https://plus.unsplash.com/premium_photo-1666270423836-864dfa7071e5?auto=format&fit=crop&q=80&w=400", 260, 290],
    ["Grape", "https://images.unsplash.com/photo-1537640538966-79f369143f8f?auto=format&fit=crop&q=80&w=400", 290, 320],
];
