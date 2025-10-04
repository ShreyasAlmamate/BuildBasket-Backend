const authOrderModel = require('../../models/authOrder')
const customerOrder = require('../../models/customerOrder')

const myShopWallet = require('../../models/myShopWallet')
const sellerWallet = require('../../models/sellerWallet')

const cardModel = require('../../models/cardModel')
const moment = require("moment")
const { responseReturn } = require('../../utiles/response') 
const { mongo: {ObjectId}} = require('mongoose')
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY || 'sk_test_your_stripe_key_here')
const { calculateOrderTotal } = require('../../utiles/orderCalculation')

class orderController{

    // Calculate order total with GST and region fare
    calculate_order_total = async (req, res) => {
        try {
            const { products, region } = req.body;

            if (!products || !Array.isArray(products)) {
                return responseReturn(res, 400, { message: 'Products array is required' });
            }

            const calculation = await calculateOrderTotal(products, region);

            if (!calculation.success) {
                return responseReturn(res, 500, { error: calculation.error });
            }

            responseReturn(res, 200, {
                success: true,
                calculation: calculation
            });
        } catch (error) {
            responseReturn(res, 500, { error: error.message });
        }
    }

    paymentCheck = async (id) => {
        try {
            const order = await customerOrder.findById(id)
            if (order.payment_status === 'unpaid') {
                await customerOrder.findByIdAndUpdate(id, {
                    delivery_status: 'cancelled'
                })
                await authOrderModel.updateMany({
                    orderId: id
                },{
                    delivery_status: 'cancelled'
                })
            }
            return true
        } catch (error) {
            console.log(error)
        }
    }

    // end method 
      
    place_order = async (req,res) => {
        const {price,products,shipping_fee,shippingInfo,userId } = req.body
        console.log('Place order request for userId:', userId, 'price:', price)
        let authorOrderData = []
        let cardId = []
        const tempDate = moment(Date.now()).format('LLL')

        let customerOrderProduct = []

        for (let i = 0; i < products.length; i++) {
            const pro = products[i].products
            for (let j = 0; j < pro.length; j++) {
                const tempCusPro = pro[j].productInfo;
                tempCusPro.quantity = pro[j].quantity
                customerOrderProduct.push(tempCusPro)
                if (pro[j]._id) {
                    cardId.push(pro[j]._id)
                } 
            } 
        }

        try {
            const order = await customerOrder.create({
                customerId: userId,
                shippingInfo,
                products: customerOrderProduct,
                price: price + shipping_fee,
                payment_status: 'unpaid',
                delivery_status: 'pending',
                date: tempDate
            })
            for (let i = 0; i < products.length; i++) {
                const pro = products[i].products
                const pri = products[i].price
                const sellerId = products[i].sellerId
                let storePor = []
                for (let j = 0; j < pro.length; j++) {
                    const tempPro = pro[j].productInfo
                    tempPro.quantity = pro[j].quantity
                    storePor.push(tempPro)                    
                }

                authorOrderData.push({
                    orderId: order.id,sellerId,
                    products: storePor,
                    price:pri,
                    payment_status: 'unpaid',
                    shippingInfo: 'Easy Main Warehouse',
                    delivery_status: 'pending',
                    date: tempDate
                }) 
            }

            await authOrderModel.insertMany(authorOrderData)
            for (let k = 0; k < cardId.length; k++) {
                await cardModel.findByIdAndDelete(cardId[k]) 
            }
   
            setTimeout(() => {
                this.paymentCheck(order.id)
            }, 15000)

            console.log('Order created successfully:', order.id)
            responseReturn(res,200,{message: "Order Placed Success" , orderId: order.id })

            
        } catch (error) {
            console.log('Place order error:', error.message) 
            responseReturn(res, 500, { error: 'Failed to place order' })
        }
 
    }

    // End Method 
    
    get_customer_dashboard_data = async(req,res) => {
        const{ userId } = req.params 
        console.log('Dashboard data request for userId:', userId)

        try {
            const recentOrders = await customerOrder.find({
                customerId: userId 
            }).limit(5).sort({ createdAt: -1 })
            const pendingOrder = await customerOrder.find({
                customerId: userId,delivery_status: 'pending'
             }).countDocuments()
             const totalOrder = await customerOrder.find({
                customerId: userId
             }).countDocuments()
             const cancelledOrder = await customerOrder.find({
                customerId: userId,delivery_status: 'cancelled'
             }).countDocuments()
             
             console.log('Dashboard data:', { recentOrders: recentOrders.length, pendingOrder, totalOrder, cancelledOrder })
             
             responseReturn(res, 200,{
                recentOrders,
                pendingOrder,
                totalOrder,
                cancelledOrder
             })
            
        } catch (error) {
            console.log('Dashboard data error:', error.message)
            responseReturn(res, 500, { error: 'Failed to fetch dashboard data' })
        } 

    }
     // End Method 

     get_orders = async (req, res) => {
        const {customerId, status} = req.params
        console.log('Get orders request for customerId:', customerId, 'status:', status)

        try {
            let orders = []
            if (status !== 'all') {
                orders = await customerOrder.find({
                    customerId: customerId,
                    delivery_status: status
                }).sort({ createdAt: -1 })
            } else {
                orders = await customerOrder.find({
                    customerId: customerId
                }).sort({ createdAt: -1 })
            }
            
            console.log('Found orders:', orders.length)
            responseReturn(res, 200,{
                orders
            })
            
        } catch (error) {
            console.log('Get orders error:', error.message)
            responseReturn(res, 500, { error: 'Failed to fetch orders' })
        }

     }
 // End Method 

 get_order_details = async (req, res) => {
    const {orderId} = req.params

    try {
        const order = await customerOrder.findById(orderId)
        responseReturn(res,200, {
            order
        })
        
    } catch (error) {
        console.log(error.message)
    }
 }
 // End Method 

 get_admin_orders = async(req, res) => {
    let {page,searchValue,parPage} = req.query
    page = parseInt(page)
    parPage= parseInt(parPage)

    const skipPage = parPage * (page - 1)

    try {
        if (searchValue) {
            
        } else {
            const orders = await customerOrder.aggregate([
                {
                    $lookup: {
                        from: 'authororders',
                        localField: "_id",
                        foreignField: 'orderId',
                        as: 'suborder'
                    }
                }
            ]).skip(skipPage).limit(parPage).sort({ createdAt: -1})

            const totalOrder = await customerOrder.aggregate([
                {
                    $lookup: {
                        from: 'authororders',
                        localField: "_id",
                        foreignField: 'orderId',
                        as: 'suborder'
                    }
                }
            ])

            responseReturn(res,200, { orders, totalOrder: totalOrder.length })
        }
    } catch (error) {
        console.log(error.message)
    } 

 }
  // End Method 
  
  get_admin_order = async (req, res) => {
    const { orderId } = req.params
    try {

        const order = await customerOrder.aggregate([
            {
                $match: {_id: new ObjectId(orderId)}
            },
            {
                $lookup: {
                    from: 'authororders',
                    localField: "_id",
                    foreignField: 'orderId',
                    as: 'suborder'
                }
            }
        ])
        responseReturn(res,200, { order: order[0] })
    } catch (error) {
        console.log('get admin order details' + error.message)
    }
  }
  // End Method 


  admin_order_status_update = async(req, res) => {
    const { orderId } = req.params
    const { status } = req.body

    try {
        await customerOrder.findByIdAndUpdate(orderId, {
            delivery_status : status
        })
        responseReturn(res,200, {message: 'order Status change success'})
    } catch (error) {
        console.log('get admin status error' + error.message)
        responseReturn(res,500, {message: 'internal server error'})
    }
     
  }
  // End Method 

  get_seller_orders = async (req,res) => {
        const {sellerId} = req.params
        let {page,searchValue,parPage} = req.query
        page = parseInt(page)
        parPage= parseInt(parPage)

        const skipPage = parPage * (page - 1)

        try {
            if (searchValue) {
                
            } else {
                const orders = await authOrderModel.find({
                    sellerId,
                }).skip(skipPage).limit(parPage).sort({ createdAt: -1})
                const totalOrder = await authOrderModel.find({
                    sellerId
                }).countDocuments()
                responseReturn(res,200, {orders,totalOrder})
            }
            
        } catch (error) {
         console.log('get seller Order error' + error.message)
         responseReturn(res,500, {message: 'internal server error'})
        }
        
  }
  // End Method 

  get_seller_order = async (req,res) => {
    const { orderId } = req.params
    
    try {
        const order = await authOrderModel.findById(orderId)
        responseReturn(res, 200, { order })
    } catch (error) {
        console.log('get seller details error' + error.message)
    }
  }
  // End Method 

  seller_order_status_update = async(req,res) => {
    const {orderId} = req.params
    const { status } = req.body

    try {
        await authOrderModel.findByIdAndUpdate(orderId,{
            delivery_status: status
        })
        responseReturn(res,200, {message: 'order status updated successfully'})
    } catch (error) {
        console.log('get seller Order error' + error.message)
        responseReturn(res,500, {message: 'internal server error'})
    }


  }
  // End Method 

  create_payment = async (req, res) => {
    const { price } = req.body
    try {
        const payment = await stripe.paymentIntents.create({
            amount: price * 100,
            currency: 'usd',
            automatic_payment_methods: {
                enabled: true
            }
        })
        responseReturn(res, 200, { clientSecret: payment.client_secret })
    } catch (error) {
        console.log(error.message)
    }
  }
  // End Method 

  order_confirm = async (req,res) => {
    const {orderId} = req.params
    try {
        await customerOrder.findByIdAndUpdate(orderId, { payment_status: 'paid' })
        await authOrderModel.updateMany({ orderId: new ObjectId(orderId)},{
            payment_status: 'paid', delivery_status: 'pending'  
        })
        const cuOrder = await customerOrder.findById(orderId)

        const auOrder = await authOrderModel.find({
            orderId: new ObjectId(orderId)
        })
         
        const time = moment(Date.now()).format('l')
        const splitTime = time.split('/')

        await myShopWallet.create({
            amount: cuOrder.price,
            month: splitTime[0],
            year: splitTime[2]
        })

        for (let i = 0; i < auOrder.length; i++) {
             await sellerWallet.create({
                sellerId: auOrder[i].sellerId.toString(),
                amount: auOrder[i].price,
                month: splitTime[0],
                year: splitTime[2]
             }) 
        }
        responseReturn(res, 200, {message: 'success'}) 
        
    } catch (error) {
        console.log(error.message)
    }
     
  }
   // End Method 

}

module.exports = new orderController()