import React, { useContext, useState } from 'react';
import Title from '../components/Title';
import CartTotal from '../components/CartTotal';
import { assets } from '../assets/frontend_assets/assets';
import { ShopContext } from '../context/ShopContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; 

const PlaceOrder = () => {
  const [method, setMethod] = useState('cod');
  const { navigate, backendUrl, token, cartItems, setCartItems, getCartAmount, delivery_fee, products } = useContext(ShopContext);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    street: '',
    city: '',
    state: '',
    zipcode: '',
    country: '',
    phone: ''
  });

  const onChangeHandler = (event) => {
    const name = event.target.name;
    const value = event.target.value;

    setFormData(data => ({ ...data, [name]: value }));
  };

  const onSubmitHandler = async (event) => {
    event.preventDefault();
    try {
      let orderItems = [];

      for (const items in cartItems) {
        for (const item in cartItems[items]) {
          if (cartItems[items][item] > 0) {
            const itemInfo = structuredClone(products.find(product => product._id === items));
            if (itemInfo) {
              itemInfo.size = item;
              itemInfo.quantity = cartItems[items][item]; // Fixed typo here
              orderItems.push(itemInfo);
            }
          }
        }
      }
 let orderData={
  address:formData,
  items:orderItems,
  amount: getCartAmount()+delivery_fee
 }
    switch(method)
    {
//-------------------COD MODE ----------------------------------
      case 'cod':
     const response=await axios.post(backendUrl+'/api/order/place',orderData,{headers:{token}});


     if(response.data.success)
     {
      navigate('/orders')
      setCartItems({})
      
     }
     else{
      toast.error(response.data.message)
     }
      break;
// --------------------------------------------------------------------
// -------------------STRIPE MODE CASE----------------------------
case 'stripe':
  const responseStripe = await axios.post(backendUrl + '/api/order/stripe', orderData, { headers: { token } });
  if (responseStripe.data.success) {
    const { session_url } = responseStripe.data;
    window.location.replace(session_url);
  } else {
    toast.error(responseStripe.data.message);
  }
  break;


      default:
        break;
    }
      
    } catch (error) {
      
     console.log(error)
     toast.error(error.message)
    }
  };

  return (
    <form onSubmit={onSubmitHandler} className='flex flex-col sm:flex-row justify-between gap-4 pt-5 sm:pt-14 min-h-[80vh] border-t'>
      {/* ----------Left side----------------------- */}
      <div className='flex flex-col gap-4 w-full sm:max-w-[480px]'>
        <div className='text-xl sm:text-2xl my-3'>
          <Title text1={'DELIVERY'} text2={'INFORMATION'} />
        </div>
        <div className='flex gap-3'>
          <input required type="text" onChange={onChangeHandler} name='firstName' value={formData.firstName} placeholder='First Name' className='border border-gray-300 rounded py-1.5 px-3.5 w-full' />
          <input required type="text" onChange={onChangeHandler} name='lastName' value={formData.lastName} placeholder='Last Name' className='border border-gray-300 rounded py-1.5 px-3.5 w-full' />
        </div>
        <input required type="email" onChange={onChangeHandler} name='email' value={formData.email} placeholder='Email Address' className='border border-gray-300 rounded py-1.5 px-3.5 w-full' />
        <input required type="text" onChange={onChangeHandler} name='street' value={formData.street} placeholder='Street' className='border border-gray-300 rounded py-1.5 px-3.5 w-full' />
        <div className='flex gap-3'>
          <input required type="text" onChange={onChangeHandler} name='city' value={formData.city} placeholder='City' className='border border-gray-300 rounded py-1.5 px-3.5 w-full' />
          <input required type="text" onChange={onChangeHandler} name='state' value={formData.state} placeholder='State' className='border border-gray-300 rounded py-1.5 px-3.5 w-full' />
        </div>
        <div className='flex gap-3'>
          <input required type="number" onChange={onChangeHandler} name='zipcode' value={formData.zipcode} placeholder='ZipCode' className='border border-gray-300 rounded py-1.5 px-3.5 w-full' />
          <input required type="text" onChange={onChangeHandler} name='country' value={formData.country} placeholder='Country' className='border border-gray-300 rounded py-1.5 px-3.5 w-full' />
        </div>
        <input required type="number" onChange={onChangeHandler} name='phone' value={formData.phone} placeholder='Phone' className='border border-gray-300 rounded py-1.5 px-3.5 w-full' />
      </div>
      
      {/* ------------Right Side-------------------- */}
      <div className='mt-8'>
        <div className='mt-8 min-w-80'>
          <CartTotal />
        </div>

        <div className='mt-12'>
          <Title text1={'PAYMENT'} text2={'METHOD'} />
          
          {/* -----------Payment Method Selection-------- */}
          <div className='flex gap-3 flex-col lg:flex-row'>
            {/* Stripe Payment */}
            <div onClick={() => setMethod('stripe')} className='flex items-center gap-3 border p-2 px-3 cursor-pointer'>
              <p className={`min-w-[1rem] h-[1rem] border rounded-full ${method === 'stripe' ? 'bg-green-400' : ''}`}></p>
              <img src={assets.stripe_logo} className='h-5 mx-4' alt="Stripe Logo" />
            </div>

            {/* Razorpay Payment */}
            <div onClick={() => setMethod('razorpay')} className='flex items-center gap-3 border p-2 px-3 cursor-pointer'>
              <p className={`min-w-[1rem] h-[1rem] border rounded-full ${method === 'razorpay' ? 'bg-green-400' : ''}`}></p>
              <img src={assets.razorpay_logo} className='h-5 mx-4' alt="Razorpay Logo" />
            </div>

            {/* Cash on Delivery */}
            <div onClick={() => setMethod('cod')} className='flex items-center gap-3 border p-2 px-3 cursor-pointer'>
              <p className={`min-w-[1rem] h-[1rem] border rounded-full ${method === 'cod' ? 'bg-green-400' : ''}`}></p>
              <p className='text-gray-500 text-sm font-medium mx-4'>CASH ON DELIVERY</p>
            </div>
          </div>

          <div className='w-full text-end mt-8'>
            <button type='submit' className='bg-black text-white px-16 py-3 text-sm'>
              PLACE ORDER
            </button>
          </div>
        </div>
      </div>
    </form>
  );
};

export default PlaceOrder;
