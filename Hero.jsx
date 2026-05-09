"use client";
import Image from "next/image";
import { motion } from "framer-motion";
import React from 'react'

const Hero = () => {
const featuredproducts=[
{name:"Speaker",image:"/image/speaker.webp",price:"$200" },
{name:"CPU",image:"/image/cpu.webp",price:"$80"},
{name:"Wireless Headphone",image:"/image/headphone.jpg",price:"$100"},
{name:"USB",image:"/image/usb.webp",price:"$12"},
{name:"Webcame",image:"/image/web.jpeg",price:"$160"},
{name:"Graphics card",image:"/image/graphic card.webp",price:"$30"},
{name:"Graphic tablet",image:"/image/tablet.jpg",price:"$120"},
{name:"Microphone",image:"/image/Microphone.jpg",price:"$85"}
]
  return (

    <main className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative flex flex-col md:flex-row items-center justify-between px-8 md:px-20 py-16 bg-gradient-to-r from-indigo-500 to-blue-500 text-white mt-14">
        <div className="max-w-xl">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="text-4xl md:text-6xl font-bold mb-6"
          >
            Modern Electronics for Every Desk
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg mb-6"
          >
            Upgrade your workspace with sleek, high-performance gadgets.
          </motion.p>

          <motion.button
            whileHover={{ scale: 1.05 }}
               initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
            className="bg-white text-indigo-600 font-semibold px-6 py-3 rounded-xl shadow-md hover:bg-gray-100 transition"
          >
            Shop Now
          </motion.button>

 </div> 
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-10 md:mt-0 md:ml-10"
    >
          <Image
            src="/Image/destop.jpeg"
            alt="Modern Desktop"
            width={500}
            height={400}
            className="rounded-2xl shadow-lg"
          />
        </motion.div>
         </section>


      {/* Categories Section */}
      <section className="py-16 px-8 md:px-20">
        <motion.h2
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          className="text-3xl font-bold text-theme mb-10 text-center">
          Browse by Category
        </motion.h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[{name :"Laptops",image:"/Image/laptop.webp"}, {name:"Monitors",image:"/Image/moniter.jpeg"}, {name:"keyboard",image:"/Image/keyboard.jpg"}, {name:"Mouse",image:"/Image/mouse.jpg"}].map(({name,image} ,i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white shadow rounded-2xl overflow-hidden cursor-pointer hover:shadow-lg transition"
            >
              <Image
                src={image}
                alt={name}
                width={400}
                height={300}
                className="w-full h-48 object-cover"
              />
              <div className="p-4 text-center font-semibold text-gray-700">
                {name}
              </div>
            </motion.div>
          ))}
        </div>
        </section>

  

     {/* Featured Products */}
      <section className="py-16 bg-gray-100 px-8 md:px-20">
        <motion.h2
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          className="text-3xl font-bold text-theme mb-10 text-center">
          Featured products
        </motion.h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuredproducts.map(({name,image,price},i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white rounded-2xl shadow hover:shadow-lg transition overflow-hidden"
            >
              <Image
                src={image}
                alt={name}
                width={400}
                height={300} 
                className="w-full h-52 object-cover"
              />
              <div className="p-5">
                <h3 className="text-lg font-semibold text-gray-700 mb-2">
                   {name}
                </h3>
                <p className="text-gray-500 mb-3">Modern and stylish gadget</p>
                <span className="text-indigo-600 font-bold">{price}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </section>


{/* Simple Reviews Section*/} 

<section className="py-16 px-8  md:px-20 bg-white">
 <motion.h2
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          className="text-3xl font-bold text-theme mb-10 text-center">
          Customer Reviews
        </motion.h2>
 
 
  

  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
    {[
      {
        review:
          "The quality is amazing and delivery was super fast",
        rating: 5,
        image: "/Image/user 1.jpeg",
      },
      {
        review:
          "Really happy with my purchase. Highly recommended!",
        rating: 4,
        image: "/Image/user 2.webp",
      },
      {
        review:
          "Great experience! Product works perfectly.",
        rating: 5,
        image: "/Image/user 3.png",
      },
    ].map(({ review, rating, image }, i) => (
      <motion.div
        key={i}
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ delay: i * 0.1 }}
        className="bg-gray-50 shadow-md rounded-1xl p-6 text-center"
      >

        <div className="flex justify-center mb-4">
          <Image
            src={image}
            alt="Customer"
            width={80}
            height={80}
            className="rounded-full object-cover border-4 border-indigo-500"
          />
        </div>

        {/* Review Text */}
        <p className="text-gray-600 mb-4 italic">"{review}"</p>

        {/* Star Rating */}
        <div className="flex justify-center">
          {[...Array(5)].map((_, index) => (
            <span
              key={index}
              className={`text-yellow-400 text-xl ${
                index < rating ? "opacity-100" : "opacity-40"
              }`}
            >
              ★
            </span>
          ))}
        </div>
      </motion.div>
    ))}
  </div>
</section>

   </main>
  );
};

export default Hero;
