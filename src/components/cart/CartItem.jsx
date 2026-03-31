import React, { useContext } from "react";
import { CartContext } from "../../contexts/CartContext";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";


const CartItem = () => {
  const { cart, removeFromCart, increaseQty, decreaseQty, proceedToBuy, } = useContext(CartContext);

  const navigate = useNavigate()

  if (!cart || cart.length === 0) {
    return (
      <div className="flex justify-center items-center h-screen text-lg text-gray-600">
        Your cart is empty
      </div>
    );
  }

  const totalPrice = cart.reduce(
    (acc, item) => acc + item.price * item.quantity, 0);

  return (
    <div className="min-h-screen p-6">
      <h1 className="text-3xl font-bold mb-6 text-emerald-700">Your Cart</h1>

      <div className="space-y-6">
        {cart.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between border-b pb-4"
          >
            <div className="flex items-center gap-4">
              <img
                src={item.imageUrl}
                alt={item.name}
                className="w-20 h-20 object-cover rounded-lg"
              />
              <div>
                <h2 className="text-lg font-semibold">{item.name}</h2>
                <p className="text-gray-500">₹{item.price}</p>

                <div className="flex items-center gap-2 mt-2">
                  <button
                    onClick={() => { decreaseQty(item.id); toast.warning("Item quantity decreased"); }}
                    className="bg-gray-200 px-2 rounded hover:bg-gray-300"
                  >
                    -
                  </button>
                  <span>{item.quantity}</span>
                  <button
                    onClick={() => { increaseQty(item.id); toast.success("Item quantity increased"); }}
                    className="bg-gray-200 px-2 rounded hover:bg-gray-300"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-end">
              <p className="font-semibold text-emerald-600">
                ₹{item.price * item.quantity}
              </p>
              <button
                onClick={() => { removeFromCart(item.id); toast.info("Item removed from cart"); }}
                className="text-red-500 hover:text-red-700 mt-2 text-sm"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-gray-800">
          Total: ₹{totalPrice}
        </h2>
        <button
          onClick={() => { toast.success("Proceeding to checkout"); navigate("/checkout"); }}
          className="bg-emerald-600 text-white px-6 py-2 rounded-lg hover:bg-emerald-700"
        >
          Proceed to Pay
        </button>
      </div>
    </div>
  );
};

export default CartItem;