import React from 'react'
// import CommanHeader from '../../components/Navbar/CommanHeader'
import { GiCheckMark } from 'react-icons/gi'

const Website = () => {
    const pricingPlans = [
        {
            name: "Landing Page",
            price: "$499",
            features: [
                "Single High-Converting Page",
                "Custom Design",
                "Mobile Responsive",
                "Basic SEO",
                "Contact Form",
                "1 Week Delivery"
            ]
        },

        {
            name: "Business Website",
            price: "$1,499",
            features: [
                "Up to 5 Pages",
                "Custom Design",
                "Mobile Responsive",
                "Basic SEO",
                "Contact Form",
                "1 Month Support"
            ],
            popular: true
        },
        {
            name: "Multi-Location CMS",
            price: "$3,499",
            features: [
                "Multi-Location Support",
                "CMS Integration (e.g. WordPress)",
                "Custom Design",
                "Advanced SEO",
                "Up to 20 Pages",
                "3 Months Support"
            ],

        },
        {
            name: "Single Page + Booking",
            price: "$2,499",
            features: [
                "Single Page Design",
                "Integrated Booking Engine",
                "Mobile Responsive",
                "Custom Design",
                "Payment Integration",
                "2 Months Support"
            ]
        }
    ];
    return (
        <div >
            {/* <CommanHeader serviceName={"Custom website"} buttonName={"Mark as interested"} /> */}
            <section id="pricing" className="py-20 px-4 bg-gray-50">
                <div className="container mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gray-600">Our Custom Website Pricing</h2>
                        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                            Choose the perfect plan for your project needs
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-10 max-w-7xl mx-auto">
                        {pricingPlans.map((plan, index) => (
                            <div key={index} className={`bg-white rounded-3xl p-8 shadow-lg relative ${plan.popular ? 'ring-4 ring-primary transform scale-105' : ''
                                }`}>
                                {plan.popular && (
                                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                                        <span className="bg-gradient-to-r from-primary to-[#fd5c01] text-white px-4 py-2 rounded-full text-sm font-bold">
                                            Most Popular
                                        </span>
                                    </div>
                                )}

                                <div className="text-center mb-8">
                                    <h3 className="text-2xl font-bold text-gray-600 mb-2">{plan.name}</h3>
                                    <div className="text-4xl font-bold text-primary mb-2">{plan.price}</div>
                                    <div className="text-gray-600">Starting from</div>
                                </div>

                                <ul className="space-y-4 mb-8">
                                    {plan.features.map((feature, featureIndex) => (
                                        <li key={featureIndex} className="flex items-center space-x-3">
                                            <GiCheckMark className="w-5 h-5 text-green-500" />
                                            <span className="text-gray-700">{feature}</span>
                                        </li>
                                    ))}
                                </ul>

                                <button onClick={(e) => { alert("Thanks for choosing this plan") }} className={`w-full py-4 rounded-full font-semibold transition-all duration-300 ${plan.popular
                                    ? 'bg-gradient-to-r from-primary to-[#fd5c01] text-white hover:shadow-lg'
                                    : 'border-2 border-gray-300 text-gray-700 hover:border-primary hover:text-blue-600'
                                    }`}>
                                    Get Started
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    )
}

export default Website