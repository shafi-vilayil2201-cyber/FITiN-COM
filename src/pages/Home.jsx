import React, { useEffect, useRef, useState } from "react";
import HeroBanner from "../components/Home/HeroBanner";
import Categories from "../components/Home/Categories";
import FeaturedProducts from "../components/Home/FeaturedProducts";
import Recommendations from "../components/Home/Recommendations";
import MembershipSection from "../components/Home/MembershipSection";
import StoriesSection from "../components/Home/StoriesSection";
import { getAllCategories, getAllProducts } from "../services/api";

const Home = () =>
{
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const categoriesSectionRef = useRef(null);

  useEffect(() =>
  {
    const fetchHomeData = async () =>
    {
      try
      {
        const [productData, categoryData] = await Promise.all([getAllProducts(), getAllCategories()]);
        setProducts(productData ?? []);
        setCategories(categoryData ?? []);
      } catch (error)
      {
        console.error("Failed to load homepage data:", error);
      } finally
      {
        setLoading(false);
      }
    };

    fetchHomeData();
  }, []);

  useEffect(() =>
  {
    if (!selectedCategory && categories.length > 0)
    {
      setSelectedCategory(categories[0].name);
    }
  }, [categories, selectedCategory]);

  const handleHeroCategorySelect = (categoryName) =>
  {
    setSelectedCategory(categoryName);
    categoriesSectionRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  return (
    <div className="pb-8 pt-6 md:pb-13">
      <HeroBanner
        products={products}
        categories={categories}
        loading={loading}
        selectedCategory={selectedCategory}
        onCategorySelect={handleHeroCategorySelect}
      />
      <Categories
        products={products}
        categories={categories}
        loading={loading}
        selectedCategory={selectedCategory}
        onCategorySelect={setSelectedCategory}
        sectionRef={categoriesSectionRef}
      />
      <FeaturedProducts products={products} loading={loading} />
      <Recommendations products={products} loading={loading} />
      <StoriesSection />
      <MembershipSection />
    </div>
  );
};

export default Home;
