import React from 'react';
import { Link } from 'react-router-dom';

function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-purple-500 to-indigo-600 text-white text-center px-4">
      <h1 className="text-6xl font-bold mb-4 animate-bounce">404</h1>
      <p className="text-2xl md:text-3xl font-semibold mb-6">Oops! Page not found 😢</p>
      <p className="mb-8 text-lg max-w-md">We couldn't find the page you were looking for. Maybe it's gone, or the link is broken.</p>
      <Link
        to="/"
        className="bg-white text-indigo-600 font-semibold px-6 py-3 rounded-xl shadow-lg hover:scale-105 transition-transform duration-300"
      >
        Take Me Home 🚀
      </Link>

      <div className="mt-12">
        <img
          src="https://illustrations.popsy.co/white/web-error.svg"
          alt="Not Found"
          className="w-72 md:w-96 mx-auto"
        />
      </div>
    </div>
  );
}

export default NotFound;
