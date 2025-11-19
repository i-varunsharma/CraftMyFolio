"use client";

export default function LoginModal({ onClose }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-lg w-[90%] max-w-md p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-4 text-gray-400 hover:text-gray-600 text-xl"
        >
          ✕
        </button>

        <h2 className="text-2xl font-semibold text-center mb-5">
          Create your account
        </h2>

        <input
          type="email"
          placeholder="Enter your email address"
          className="w-full border border-gray-300 rounded-full px-4 py-3 mb-3 focus:outline-none focus:ring-2 focus:ring-pink-400"
        />
        <input
          type="password"
          placeholder="Enter your password"
          className="w-full border border-gray-300 rounded-full px-4 py-3 mb-5 focus:outline-none focus:ring-2 focus:ring-pink-400"
        />

        <button className="w-full bg-pink-500 hover:bg-pink-600 text-white font-medium py-3 rounded-full mb-4 transition-all">
          Continue →
        </button>

        <div className="text-center text-gray-500 mb-4">OR</div>

        <button className="w-full border border-gray-300 flex items-center justify-center gap-2 py-3 rounded-full hover:bg-gray-50">
          <img src="/google-icon.svg" alt="Google" className="w-5 h-5" />
          Continue with Google
        </button>
      </div>
    </div>
  );
}
