import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAllProducts } from "../../services/api";


const Categories = () => {
    const [categories, setCategories] = useState([]);
    const [products, setProducts] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await getAllProducts();

                const uniqueCategories = Array.from(
                    new Map(data.map((item) => [item.category, item.image])).entries()
                ).map(([name, image]) => ({ name, image }));

                setCategories(uniqueCategories);
                setProducts(data);
            } catch (error) {
                console.error("Error fetching products:", error);
            }
        };
        fetchData();
    }, []);

    const navigate = useNavigate();


    const filteredProducts = selectedCategory
        ? products.filter((p) => p.category === selectedCategory)
        : [];

    return (
        <>

            <div className="p-0 md:p-20 w-[95%] min-h-screen md:h-min mx-auto  rounded-2xl pt-5">
                <h1 className="text-4xl font-extrabold mb-10 text-emerald-700 text-center tracking-wide drop-shadow-sm">Pick a Category</h1>


                <div className="w-full mb-0">
                    <div className="flex flex-wrap justify-center gap-3 md:gap-5 w-full">
                        {categories.map((cat, index) => (
                            <div
                                key={index}
                                onClick={() => setSelectedCategory(cat.name)}
                                className={`relative flex flex-col items-center justify-center w-28 h-36 md:w-30 md:h-30 rounded-3xl cursor-pointer overflow-hidden transition-all duration-500 transform 
                                ${selectedCategory === cat.name
                                        ? " text-green scale-105 shadow-2xl ring-3 ring-emerald-200"
                                        : " text-green hover:from-emerald-800 hover:to-teal-700 hover:scale-105 shadow-lg hover:shadow-emerald-500/50"
                                    }`}
                            >
                                <div className="absolute inset-0 bg-white/10 backdrop-blur-sm opacity-0 hover:opacity-20 transition-opacity duration-500"></div>
                                <div className="w-15 h-15 ring-8  ring-emerald-600/40 rounded-full">
                                    <img
                                        src={cat.image || "https://via.placeholder.com/100"}
                                        alt={cat.name}
                                        className="w-15 h-15 rounded-full object-cover mb-0 shadow-xl ring-4 ring-emerald-600/30 transition-transform duration-700 ease-in-out hover:scale-110 hover:-translate-y-2"
                                    /></div>
                                <span className=" text-sm tracking-wide uppercase drop-shadow-sm mt-2">{cat.name}</span>
                            </div>
                        ))}
                    </div>
                </div>


                {selectedCategory && (
                    <div className="mt-8">
                        <h2 className="text-3xl font-bold mb-6 text-emerald-700 border-b-4 border-emerald-500 inline-block pb-1">
                            {selectedCategory}
                        </h2>

                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {filteredProducts.map((product) => (
                                <div
                                    key={product.id}
                                    className="border border-gray-100 rounded-2xl p-6 bg-white shadow-md hover:shadow-2xl hover:-translate-y-3 transition-all duration-500"
                                >
                                    <img
                                        src={product.image}
                                        alt={product.name}
                                        className="w-full h-60 object-cover rounded-xl mb-5 shadow-lg transition-transform duration-700 ease-in-out hover:scale-110"
                                    />
                                    <h3 className="text-lg font-semibold">{product.name}</h3>
                                    <p className="text-sm text-gray-600">{product.brand}</p>
                                    <div className=" flex justify-between">
                                        <p className="text-emerald-600 font-bold mt-2">
                                            ₹{product.price}
                                        </p>
                                        <button
                                            onClick={() => navigate(`/products/${product.id}`)}
                                            className="px-5 py-2.5 bg-linear-to-r from-emerald-500 to-emerald-700 text-white text-sm font-semibold rounded-lg shadow hover:from-emerald-600 hover:to-emerald-800 transition-all duration-300 transform hover:scale-105"
                                        >View Details</button>
                                    </div>

                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};

export default Categories;