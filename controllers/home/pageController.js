const { responseReturn } = require("../../utiles/response");

class pageController {
    
    // Get About Us page data
    get_about_data = async (req, res) => {
        try {
            const aboutData = {
                companyInfo: {
                    name: "BUILD BASKET",
                    founded: "2020",
                    mission: "To revolutionize the way construction materials are sourced, delivered, and managed",
                    vision: "To become the leading digital marketplace for construction materials",
                    values: [
                        "Quality - We never compromise on the quality of materials",
                        "Trust - Building trust through transparency and reliability", 
                        "Innovation - Continuously improving our platform and services",
                        "Service - Exceptional customer service is our priority"
                    ]
                },
                contactInfo: {
                    email: "support@buildbasket.com",
                    phone: "+(123) 3243 343",
                    address: "Construction Hub, Building Materials District",
                    workingHours: "Mon-Fri 9AM-6PM"
                },
                stats: {
                    totalProducts: 10000,
                    happyCustomers: 5000,
                    suppliers: 500,
                    yearsExperience: 4
                }
            };
            
            responseReturn(res, 200, { aboutData });
        } catch (error) {
            responseReturn(res, 500, { error: error.message });
        }
    };

    // Get pricing information and categories
    get_pricing_data = async (req, res) => {
        try {
            const pricingData = {
                categories: [
                    {
                        name: "Building Materials",
                        description: "Cement, bricks, steel, and other construction essentials",
                        priceRange: { min: 50, max: 5000 },
                        popularProducts: ["Portland Cement", "Steel Rods", "Red Bricks"]
                    },
                    {
                        name: "Electrical",
                        description: "Wires, switches, fixtures, and electrical components",
                        priceRange: { min: 10, max: 2000 },
                        popularProducts: ["Copper Wires", "LED Lights", "Switches"]
                    },
                    {
                        name: "Plumbing",
                        description: "Pipes, fittings, fixtures, and plumbing accessories",
                        priceRange: { min: 20, max: 1500 },
                        popularProducts: ["PVC Pipes", "Faucets", "Water Tanks"]
                    },
                    {
                        name: "Tools & Equipment",
                        description: "Hand tools, power tools, and construction equipment",
                        priceRange: { min: 30, max: 10000 },
                        popularProducts: ["Drill Machine", "Hammer", "Measuring Tape"]
                    }
                ],
                pricingFeatures: [
                    "Competitive market rates",
                    "Bulk discount available",
                    "Price comparison tools",
                    "Transparent pricing",
                    "No hidden fees"
                ],
                deliveryInfo: {
                    standardDelivery: "3-5 business days",
                    expressDelivery: "1-2 business days",
                    freeShippingThreshold: 500,
                    deliveryCharges: "Starting from $20"
                }
            };
            
            responseReturn(res, 200, { pricingData });
        } catch (error) {
            responseReturn(res, 500, { error: error.message });
        }
    };

    // Get FAQ data
    get_faq_data = async (req, res) => {
        try {
            const faqData = [
                {
                    question: "How do I track my order?",
                    answer: "You can track your order by entering your order ID in the Track Order page. You'll receive real-time updates on your shipment status."
                },
                {
                    question: "What are your delivery charges?",
                    answer: "Delivery charges start from $20. Free shipping is available for orders above $500."
                },
                {
                    question: "Do you offer bulk discounts?",
                    answer: "Yes, we offer special pricing for bulk orders. Contact our sales team for custom quotes."
                },
                {
                    question: "What is your return policy?",
                    answer: "We offer a 30-day return policy for unused items in original packaging. Contact customer support for returns."
                },
                {
                    question: "How can I contact customer support?",
                    answer: "You can reach us via email at support@buildbasket.com, phone at +(123) 3243 343, or through our live chat feature."
                }
            ];
            
            responseReturn(res, 200, { faqData });
        } catch (error) {
            responseReturn(res, 500, { error: error.message });
        }
    };
}

module.exports = new pageController();
