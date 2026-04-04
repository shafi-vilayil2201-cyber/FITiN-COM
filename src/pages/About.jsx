import React from 'react';
import { FaRunning, FaDumbbell, FaAppleAlt } from 'react-icons/fa';

const About = () => {
  return (
    <div className="min-h-scree flex flex-col items-center px-15 py-16">

      <h1 className="text-5xl md:text-6xl font-extrabold text-blue-900 mb-6 text-center ">
        Welcome to FitN
      </h1>
      <p className="text-lg md:text-xl text-gray-700 max-w-3xl text-center mb-12">
        FitN is your ultimate fitness companion. Our mission is to help you stay healthy, motivated, and consistent with your fitness goals. Whether you’re a beginner or a fitness enthusiast, we provide tools and guidance to make your journey enjoyable and effective.
      </p>


      <div className="grid md:grid-cols-3 gap-8 text-center w-full max-w-5xl">
        <div className="bg-white p-8 rounded-xl shadow-lg transform transition duration-500 hover:scale-105 hover:shadow-2xl cursor-pointer">
          <FaRunning className="mx-auto text-blue-500 text-6xl mb-4 animate-pulse" />
          <h2 className="text-2xl font-bold mb-2 text-gray-800">Track Progress</h2>
          <p className="text-gray-600">Monitor your workouts and visualize your improvement over time.</p>
        </div>

        <div className="bg-white p-8 rounded-xl shadow-lg transform transition duration-500 hover:scale-105 hover:shadow-2xl cursor-pointer">
          <FaDumbbell className="mx-auto text-green-500 text-6xl mb-4 " />
          <h2 className="text-2xl font-bold mb-2 text-gray-800">Personalized Plans</h2>
          <p className="text-gray-600">Receive workout plans tailored to your goals and fitness level.</p>
        </div>

        <div className="bg-white p-8 rounded-xl shadow-lg transform transition duration-1000 hover:scale-105 hover:shadow-2xl cursor-pointer">
          <FaAppleAlt className="mx-auto text-red-400 text-6xl mb-4 animate-pulse/30" />
          <h2 className="text-2xl font-bold mb-2 text-gray-800">Nutrition Tips</h2>
          <p className="text-gray-600">Get expert guidance on meals and nutrition for optimal results.</p>
        </div>
      </div>


      <p className="mt-16 text-gray-500 text-sm text-center">
        Join thousands of others on their fitness journey with FitN and experience the difference!
      </p>
    </div>
  );
};

export default About;