import React from 'react';
import { motion } from 'framer-motion';
import Lottie from 'lottie-react';
import 'animate.css';

// Example Lottie animation data (you can replace this with your own Lottie JSON)
const lottieAnimationData = {
    "v": "5.7.4",
    "fr": 30,
    "ip": 0,
    "op": 90,
    "w": 400,
    "h": 400,
    "nm": "Example Animation",
    "ddd": 0,
    "assets": [],
    "layers": [
        {
            "ddd": 0,
            "ind": 1,
            "ty": 4,
            "nm": "Circle",
            "sr": 1,
            "ks": {
                "o": { "a": 0, "k": 100 },
                "r": { "a": 0, "k": 0 },
                "p": { "a": 0, "k": [200, 200, 0] },
                "a": { "a": 0, "k": [0, 0, 0] },
                "s": {
                    "a": 1, "k": [
                        { "i": { "x": [0.667], "y": [1] }, "o": { "x": [0.333], "y": [0] }, "t": 0, "s": [0] },
                        { "i": { "x": [0.667], "y": [1] }, "o": { "x": [0.333], "y": [0] }, "t": 45, "s": [100] },
                        { "t": 90, "s": [0] }
                    ]
                }
            },
            "ao": 0,
            "shapes": [
                {
                    "ty": "gr",
                    "it": [
                        {
                            "d": 1,
                            "ty": "el",
                            "s": { "a": 0, "k": [100, 100] },
                            "p": { "a": 0, "k": [0, 0] },
                            "nm": "Ellipse Path 1",
                            "mn": "ADBE Vector Shape - Ellipse",
                            "hd": false
                        },
                        {
                            "ty": "st",
                            "c": { "a": 0, "k": [0.2, 0.6, 1, 1] },
                            "o": { "a": 0, "k": 100 },
                            "w": { "a": 0, "k": 4 },
                            "lc": 1,
                            "lj": 1,
                            "ml": 4,
                            "bm": 0,
                            "d": [
                                { "n": "d", "nm": "dash", "v": { "a": 0, "k": 0 } },
                                { "n": "g", "nm": "gap", "v": { "a": 0, "k": 0 } },
                                { "n": "o", "nm": "offset", "v": { "a": 0, "k": 0 } }
                            ],
                            "nm": "Stroke 1",
                            "mn": "ADBE Vector Graphic - Stroke",
                            "hd": false
                        },
                        {
                            "ty": "tr",
                            "p": { "a": 0, "k": [0, 0] },
                            "a": { "a": 0, "k": [0, 0] },
                            "s": { "a": 0, "k": [100, 100] },
                            "r": { "a": 0, "k": 0 },
                            "o": { "a": 0, "k": 100 },
                            "sk": { "a": 0, "k": 0 },
                            "sa": { "a": 0, "k": 0 },
                            "nm": "Transform"
                        }
                    ],
                    "nm": "Ellipse 1",
                    "np": 2,
                    "cix": 2,
                    "bm": 0,
                    "ix": 1,
                    "mn": "ADBE Vector Group",
                    "hd": false
                }
            ],
            "ip": 0,
            "op": 90,
            "st": 0,
            "bm": 0
        }
    ],
    "markers": []
};

export function AnimationExamples() {
    return (
        <div className="p-8 space-y-8">
            <h2 className="text-3xl font-bold text-center mb-8">Animation Examples</h2>

            {/* Framer Motion Examples */}
            <div className="space-y-4">
                <h3 className="text-xl font-semibold">Framer Motion Animations</h3>

                {/* Basic Fade In */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="p-4 bg-blue-100 rounded-lg"
                >
                    <p>Fade in animation with Framer Motion</p>
                </motion.div>

                {/* Hover Animation */}
                <motion.div
                    whileHover={{ scale: 1.05, rotate: 2 }}
                    whileTap={{ scale: 0.95 }}
                    className="p-4 bg-green-100 rounded-lg cursor-pointer"
                >
                    <p>Hover me for scale and rotation!</p>
                </motion.div>

                {/* Stagger Animation */}
                <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={{
                        hidden: { opacity: 0 },
                        visible: {
                            opacity: 1,
                            transition: {
                                staggerChildren: 0.1
                            }
                        }
                    }}
                    className="flex space-x-2"
                >
                    {[1, 2, 3, 4, 5].map((item) => (
                        <motion.div
                            key={item}
                            variants={{
                                hidden: { opacity: 0, y: 20 },
                                visible: { opacity: 1, y: 0 }
                            }}
                            className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center"
                        >
                            {item}
                        </motion.div>
                    ))}
                </motion.div>
            </div>

            {/* Animate.css Examples */}
            <div className="space-y-4">
                <h3 className="text-xl font-semibold">Animate.css Animations</h3>

                <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-yellow-100 rounded-lg animate__animated animate__bounce">
                        <p>Bounce Animation</p>
                    </div>
                    <div className="p-4 bg-red-100 rounded-lg animate__animated animate__pulse">
                        <p>Pulse Animation</p>
                    </div>
                    <div className="p-4 bg-indigo-100 rounded-lg animate__animated animate__fadeInLeft">
                        <p>Fade In Left</p>
                    </div>
                    <div className="p-4 bg-pink-100 rounded-lg animate__animated animate__fadeInRight">
                        <p>Fade In Right</p>
                    </div>
                </div>
            </div>

            {/* Lottie Animation */}
            <div className="space-y-4">
                <h3 className="text-xl font-semibold">Lottie Animation</h3>
                <div className="flex justify-center">
                    <div className="w-64 h-64">
                        <Lottie
                            animationData={lottieAnimationData}
                            loop={true}
                            autoplay={true}
                        />
                    </div>
                </div>
            </div>

            {/* Tailwind CSS Animations */}
            <div className="space-y-4">
                <h3 className="text-xl font-semibold">Tailwind CSS Animations</h3>

                <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-orange-100 rounded-lg animate-pulse">
                        <p>Tailwind Pulse</p>
                    </div>
                    <div className="p-4 bg-teal-100 rounded-lg animate-bounce">
                        <p>Tailwind Bounce</p>
                    </div>
                    <div className="p-4 bg-cyan-100 rounded-lg animate-spin">
                        <p>Tailwind Spin</p>
                    </div>
                    <div className="p-4 bg-lime-100 rounded-lg animate-ping">
                        <p>Tailwind Ping</p>
                    </div>
                </div>
            </div>

            {/* Custom CSS Animations */}
            <div className="space-y-4">
                <h3 className="text-xl font-semibold">Custom CSS Animations</h3>

                <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover-lift">
                        <p>Hover Lift Effect</p>
                    </div>
                    <div className="p-4 bg-gradient-to-r from-green-500 to-blue-600 text-white rounded-lg hover-glow">
                        <p>Hover Glow Effect</p>
                    </div>
                    <div className="p-4 bg-gradient-to-r from-pink-500 to-red-600 text-white rounded-lg hover-scale">
                        <p>Hover Scale Effect</p>
                    </div>
                    <div className="p-4 bg-gradient-to-r from-yellow-500 to-orange-600 text-white rounded-lg hover-rotate">
                        <p>Hover Rotate Effect</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

