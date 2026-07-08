import axios from 'axios';

const BASE_URL = 'https://fitin-api-shafi-f9esb5evfuebhhgj.centralindia-01.azurewebsites.net/api';

const categoriesToSeed = [
  { name: 'Protein', imageUrl: 'https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?auto=format&fit=crop&w=900&q=80' },
  { name: 'Energy', imageUrl: 'https://images.unsplash.com/photo-1593095948071-474c5cc2989d?auto=format&fit=crop&w=900&q=80' },
  { name: 'Wellness', imageUrl: 'https://images.unsplash.com/photo-1579722821273-0f6c4d44362f?auto=format&fit=crop&w=900&q=80' },
  { name: 'Hydration', imageUrl: 'https://images.unsplash.com/photo-1622484212850-eb596d769edc?auto=format&fit=crop&w=900&q=80' },
  { name: 'Recovery', imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=900&q=80' }
];

const productsToSeed = [
  {
    name: "Whey Protein Isolate",
    categoryName: "Protein",
    price: 2499,
    stock: 50,
    imageUrl: "https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?auto=format&fit=crop&w=900&q=80",
    brand: "FitN Labs",
    sport: "Fitness",
    description: "Elite clean filtered whey protein isolate for rapid recovery and muscle growth.",
    shortDescription: "Elite ultra-filtered recovery blend.",
    longDescription: "Premium ultra-filtered whey isolate featuring 25g of protein, 0g sugar, and essential BCAAs per serving. Designed for immediate absorption post-workout.",
    rating: 4.8,
    discount: 10
  },
  {
    name: "Pre-Workout Focus",
    categoryName: "Energy",
    price: 1899,
    stock: 40,
    imageUrl: "https://images.unsplash.com/photo-1593095948071-474c5cc2989d?auto=format&fit=crop&w=900&q=80",
    brand: "Core Fuel",
    sport: "Fitness",
    description: "High-octane pre-workout focus blend to enhance energy and endurance.",
    shortDescription: "Explosive citrus charge pre-workout.",
    longDescription: "Formulated with premium L-Citrulline, Beta-Alanine, and clean natural caffeine to maximize blood flow, focus, and athletic stamina without the crash.",
    rating: 4.7,
    discount: 5
  },
  {
    name: "Daily Multivitamin",
    categoryName: "Wellness",
    price: 1299,
    stock: 60,
    imageUrl: "https://images.unsplash.com/photo-1579722821273-0f6c4d44362f?auto=format&fit=crop&w=900&q=80",
    brand: "WellForm",
    sport: "Wellness",
    description: "Complete daily vitamin and mineral support for active athletes.",
    shortDescription: "Daily comprehensive micronutrient support.",
    longDescription: "Includes 24 essential vitamins and minerals tailored to support metabolic performance, joint health, immune function, and cellular energy.",
    rating: 4.9,
    discount: 0
  },
  {
    name: "Hydration Electro Mix",
    categoryName: "Hydration",
    price: 999,
    stock: 85,
    imageUrl: "https://images.unsplash.com/photo-1622484212850-eb596d769edc?auto=format&fit=crop&w=900&q=80",
    brand: "Pulse Hydrate",
    sport: "Athletics",
    description: "Rapid electrolyte replenishment drink mix for peak endurance.",
    shortDescription: "Endurance-ready rapid hydration.",
    longDescription: "Scientifically balanced ratio of sodium, potassium, and magnesium to prevent cramping and maintain fluid balance during intense training sessions.",
    rating: 4.6,
    discount: 15
  },
  {
    name: "Plant Protein Blend",
    categoryName: "Protein",
    price: 2199,
    stock: 35,
    imageUrl: "https://images.unsplash.com/photo-1610725664285-7c57e6eeac3f?auto=format&fit=crop&w=900&q=80",
    brand: "Nature Lift",
    sport: "Fitness",
    description: "All-natural vegan plant protein blend with smooth vanilla flavor.",
    shortDescription: "Organic pea & brown rice protein.",
    longDescription: "Organic plant-based protein featuring pea, hemp, and chia seeds. Provides a complete amino acid profile, high digestibility, and delicious natural vanilla flavor.",
    rating: 4.5,
    discount: 0
  },
  {
    name: "Omega Recovery Caps",
    categoryName: "Recovery",
    price: 1499,
    stock: 45,
    imageUrl: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=900&q=80",
    brand: "MoveWell",
    sport: "Wellness",
    description: "High-potency omega-3 recovery caps for joint comfort and cardiovascular support.",
    shortDescription: "Triple-strength EPA/DHA recovery caps.",
    longDescription: "Provides 1200mg of active EPA and DHA per serving. Reduces exercise-induced joint inflammation, supports muscle protein synthesis, and boosts cognitive focus.",
    rating: 4.8,
    discount: 12
  }
];

async function seed() {
  try {
    console.log('1. Logging in as Admin...');
    const loginForm = new FormData();
    loginForm.append('Email', 'shafivilayil2201@gmail.com');
    loginForm.append('Password', 'Shafi@fitin2201');

    const loginRes = await axios.post(`${BASE_URL}/auth/login`, loginForm, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });

    const token = loginRes.data?.data?.accessToken;
    if (!token) {
      throw new Error('Login failed: Token not found');
    }
    console.log('✓ Login Successful!');

    const authHeaders = {
      Authorization: `Bearer ${token}`,
    };

    console.log('\n2. Fetching current categories...');
    const catRes = await axios.get(`${BASE_URL}/categories`);
    const existingCats = catRes.data?.data || [];
    console.log(`Found ${existingCats.length} existing categories.`);

    const categoryMap = {}; // name -> id
    existingCats.forEach(c => {
      categoryMap[c.name.toLowerCase()] = c.id;
    });

    console.log('\n3. Seeding categories if missing...');
    for (const cat of categoriesToSeed) {
      const key = cat.name.toLowerCase();
      if (!categoryMap[key]) {
        console.log(`Category "${cat.name}" is missing. Creating...`);
        const catForm = new FormData();
        catForm.append('Name', cat.name);
        if (cat.imageUrl) catForm.append('ImageUrl', cat.imageUrl);

        const createRes = await axios.post(`${BASE_URL}/categories`, catForm, {
          headers: {
            ...authHeaders,
            'Content-Type': 'multipart/form-data'
          }
        });
        const newCat = createRes.data?.data;
        console.log(`✓ Created category: ${cat.name} (${newCat.id})`);
        categoryMap[key] = newCat.id;
      } else {
        console.log(`Category "${cat.name}" already exists.`);
      }
    }

    console.log('\n4. Fetching current products...');
    const prodRes = await axios.get(`${BASE_URL}/products`);
    const existingProds = prodRes.data?.data || [];
    console.log(`Found ${existingProds.length} existing products.`);

    const existingProdNames = new Set(existingProds.map(p => p.name.toLowerCase()));

    console.log('\n5. Seeding products if missing...');
    for (const prod of productsToSeed) {
      if (!existingProdNames.has(prod.name.toLowerCase())) {
        console.log(`Product "${prod.name}" is missing. Seeding...`);
        
        const catId = categoryMap[prod.categoryName.toLowerCase()];
        if (!catId) {
          console.error(`Error: Category "${prod.categoryName}" not found for product "${prod.name}"`);
          continue;
        }

        const prodForm = new FormData();
        prodForm.append('Name', prod.name);
        prodForm.append('Price', String(prod.price));
        prodForm.append('CategoryId', catId);
        prodForm.append('Stock', String(prod.stock));
        prodForm.append('ImageUrl', prod.imageUrl);
        prodForm.append('Brand', prod.brand);
        prodForm.append('Sport', prod.sport);
        prodForm.append('Description', prod.description);
        prodForm.append('ShortDescription', prod.shortDescription);
        prodForm.append('LongDescription', prod.longDescription);
        prodForm.append('Rating', String(prod.rating));
        prodForm.append('Discount', String(prod.discount));

        await axios.post(`${BASE_URL}/admin/products`, prodForm, {
          headers: {
            ...authHeaders,
            'Content-Type': 'multipart/form-data'
          }
        });
        console.log(`✓ Seeded product: ${prod.name}`);
      } else {
        console.log(`Product "${prod.name}" already exists.`);
      }
    }

    console.log('\n✓ Seeding process completed successfully!');
  } catch (err) {
    console.error('\n❌ Seeding failed:', err.response?.data || err.message);
  }
}

seed();
