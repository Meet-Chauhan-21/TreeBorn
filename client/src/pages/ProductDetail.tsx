import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Star, Heart, ShoppingBag, Plus, Minus, Check, ArrowLeft, ShieldCheck, Sparkles, Truck } from 'lucide-react';
import { toast } from 'sonner';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import Container from '../components/layout/Container';
import Button from '../components/layout/Button';
import WhatsAppButton from '../components/layout/WhatsAppButton';
import { useStore } from '../context/StoreContext';

export const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart, toggleWishlist, isInWishlist, setIsCartOpen, products, productsLoading } = useStore();

  const [selectedSize, setSelectedSize] = useState('50ml');
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'desc' | 'ingredients' | 'benefits' | 'shipping'>('desc');
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  // Find the product
  const product = products.find((p) => p.id === id);

  // Scroll to top on load or product change
  useEffect(() => {
    window.scrollTo(0, 0);
    if (product) {
      setSelectedSize('50ml');
      setQuantity(1);
      setActiveTab('desc');
      setSelectedImageIndex(0);
    }
  }, [id, product]);

  if (productsLoading) {
    return (
      <>
        <Navbar />
        <main className="pt-32 pb-20 min-h-[60vh] flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        </main>
        <Footer />
      </>
    );
  }

  if (!product) {
    return (
      <>
        <Navbar />
        <main className="pt-32 pb-20 flex flex-col items-center justify-center min-h-[60vh] text-center">
          <Container>
            <h2 className="text-2xl font-display font-semibold text-dark mb-4">Apothecary Formulation Not Found</h2>
            <p className="text-gray-500 text-sm mb-6 max-w-sm mx-auto">
              The product you are trying to view does not exist in our botanical collection or has been retired.
            </p>
            <Button onClick={() => navigate('/')} variant="primary">
              Return to Catalog
            </Button>
          </Container>
        </main>
        <Footer />
      </>
    );
  }

  const isWishlisted = isInWishlist(product.id);

  // Compute price based on size
  const getPrice = () => {
    if (selectedSize === '30ml') return product.price - 12;
    if (selectedSize === '100ml') return product.price + 35;
    return product.price;
  };

  const handleAddToCart = () => {
    const customProduct = { ...product, price: getPrice() };
    addToCart(customProduct, quantity, selectedSize);
    setIsCartOpen(true);
    toast.success(`${product.name} (${selectedSize}) added to bag.`);
  };

  const handleToggleWishlist = () => {
    toggleWishlist(product);
    if (isWishlisted) {
      toast.info('Removed from your wishlist.');
    } else {
      toast.success('Added to your wishlist!');
    }
  };

  const galleryImages = [
    ...(product.images || []),
    product.image,
    product.hoverImage,
  ].filter((image, index, list) => Boolean(image) && list.indexOf(image) === index);

  // Find similar products in the same category, excluding active product
  const similarProducts = products.filter(
    (p) => p.category === product.category && p.id !== product.id
  ).slice(0, 4);

  // Fallback: If no similar products in same category, show other bestsellers
  const backupSimilar = products.filter((p) => p.id !== product.id).slice(0, 4);
  const displaySimilar = similarProducts.length > 0 ? similarProducts : backupSimilar;

  const sizes = ['30ml', '50ml', '100ml'];

  return (
    <>
      <Helmet>
        <title>{`${product.name} — TREEBORN Skincare`}</title>
        <meta name="description" content={product.description} />
      </Helmet>

      <Navbar />

      <main className="pt-28 pb-20 bg-white">
        <Container>
          {/* Back link */}
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs font-display font-semibold text-gray-500 hover:text-primary mb-8 transition-colors uppercase tracking-wider focus:outline-none"
          >
            <ArrowLeft size={14} />
            <span>Back to Botanical collection</span>
          </Link>

          {/* Product presentation sheet */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 mb-20">
            
            {/* Left Column: Image showcase with secondary angles */}
            <div className="lg:col-span-6 space-y-4">
              <div className="aspect-[4/5] rounded-3xl overflow-hidden bg-light-gray border border-border-gray/30 shadow-sm relative group">
                {product.discount && (
                  <span className="absolute top-4 left-4 bg-primary text-white text-[10px] font-display font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm z-10">
                    Save {product.discount}%
                  </span>
                )}
                <img
                  src={galleryImages[selectedImageIndex] || product.image}
                  alt={product.name}
                  className="w-full h-full object-cover object-center transform group-hover:scale-105 transition-transform duration-1000"
                />
              </div>
              
              {/* Product close-ups thumbnails for premium feel */}
              <div className="grid grid-cols-3 gap-4">
                {galleryImages.slice(0, 3).map((image, index) => (
                  <button
                    key={image}
                    type="button"
                    onClick={() => setSelectedImageIndex(index)}
                    className={`aspect-square rounded-2xl overflow-hidden bg-light-gray border shadow-xs cursor-pointer transition-opacity ${selectedImageIndex === index ? 'border-primary opacity-100' : 'border-border-gray/25 opacity-80 hover:opacity-100'}`}
                    aria-label={`View product image ${index + 1}`}
                  >
                    <img src={image} alt={`${product.name} view ${index + 1}`} className="w-full h-full object-cover object-center" />
                  </button>
                ))}
                {galleryImages.length < 3 && (
                  <div className="aspect-square rounded-2xl overflow-hidden bg-accent-sage/30 border border-border-gray/25 shadow-xs flex items-center justify-center text-center p-3 text-[10px] font-display font-semibold text-primary">
                    Botanical Extract Core
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Spec description and actions sheet */}
            <div className="lg:col-span-6 flex flex-col justify-between py-2">
              <div className="space-y-6">
                <div>
                  <span className="text-xs text-secondary font-bold font-display uppercase tracking-widest block mb-1.5">
                    {product.category}
                  </span>
                  <h1 className="text-3xl sm:text-4xl font-display font-bold text-dark tracking-tight leading-snug">
                    {product.name}
                  </h1>

                  {/* Rating summary */}
                  <div className="flex items-center gap-2 mt-3">
                    <div className="flex text-yellow-400">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={14}
                          fill={i < Math.floor(product.rating) ? 'currentColor' : 'none'}
                          className="stroke-1.5"
                        />
                      ))}
                    </div>
                    <span className="text-xs font-sans text-gray-500 font-medium">
                      {product.rating} ({product.reviewsCount} verified reviews)
                    </span>
                  </div>
                </div>

                {/* Price Display */}
                <div className="flex items-baseline gap-2.5">
                  <span className="text-3xl font-display font-bold text-dark">
                    ${getPrice().toFixed(2)}
                  </span>
                  {product.oldPrice && selectedSize === '50ml' && (
                    <span className="text-lg text-gray-400 font-medium line-through font-display">
                      ${product.oldPrice.toFixed(2)}
                    </span>
                  )}
                </div>

                <p className="text-gray-600 text-sm sm:text-base leading-relaxed font-sans">
                  {product.description}
                </p>

                {/* Size Selector */}
                <div className="space-y-3.5 pt-2">
                  <span className="text-xs font-semibold text-dark/80 font-display uppercase tracking-wider block">
                    Select volume:
                  </span>
                  <div className="flex gap-2.5">
                    {sizes.map((sz) => (
                      <button
                        key={sz}
                        onClick={() => setSelectedSize(sz)}
                        className={`px-5 py-2.5 border rounded-full text-xs font-medium font-sans tracking-wide transition-all cursor-pointer ${
                          selectedSize === sz
                            ? 'border-primary bg-primary text-white shadow-sm'
                            : 'border-border-gray bg-white text-dark hover:border-dark'
                        }`}
                      >
                        {sz}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Premium Trust Indicators */}
                <div className="grid grid-cols-3 gap-2.5 pt-4 text-[10px] sm:text-xs text-gray-600 font-sans border-t border-border-gray/40">
                  <div className="flex items-center gap-2 font-medium">
                    <ShieldCheck size={16} className="text-primary flex-shrink-0" />
                    <span>Dermatologist Tested</span>
                  </div>
                  <div className="flex items-center gap-2 font-medium">
                    <Sparkles size={16} className="text-primary flex-shrink-0" />
                    <span>100% Bio-Organic</span>
                  </div>
                  <div className="flex items-center gap-2 font-medium">
                    <Truck size={16} className="text-primary flex-shrink-0" />
                    <span>Climate Neutral Ship</span>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex items-center gap-4 pt-6 border-t border-border-gray/40">
                  {/* Quantity counters */}
                  <div className="flex items-center border border-border-gray/60 rounded-full bg-light-gray overflow-hidden">
                    <button
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className="p-3.5 hover:bg-gray-200 text-dark/70 transition-colors focus:outline-none cursor-pointer"
                    >
                      <Minus size={13} strokeWidth={2.5} />
                    </button>
                    <span className="px-4 text-sm font-semibold text-dark font-sans">{quantity}</span>
                    <button
                      onClick={() => setQuantity((q) => q + 1)}
                      className="p-3.5 hover:bg-gray-200 text-dark/70 transition-colors focus:outline-none cursor-pointer"
                    >
                      <Plus size={13} strokeWidth={2.5} />
                    </button>
                  </div>

                  {/* Add to Bag CTA */}
                  <button
                    onClick={handleAddToCart}
                    className="flex-grow bg-primary hover:bg-primary-light active:scale-[0.99] text-white py-4 px-6 rounded-full font-display font-semibold text-xs tracking-wider uppercase flex items-center justify-center gap-2 cursor-pointer shadow-md transition-all duration-300"
                  >
                    <ShoppingBag size={14} />
                    <span>Add to Bag</span>
                  </button>

                  {/* Wishlist CTA */}
                  <button
                    onClick={handleToggleWishlist}
                    className={`p-4 border rounded-full flex items-center justify-center transition-all cursor-pointer focus:outline-none ${
                      isWishlisted
                        ? 'border-red-500 text-red-500 bg-red-50/20'
                        : 'border-border-gray text-dark hover:border-primary hover:text-primary'
                    }`}
                    aria-label="Wishlist toggle"
                  >
                    <Heart size={18} fill={isWishlisted ? '#EF4444' : 'none'} />
                  </button>
                </div>
              </div>

              {/* Specification Tab System */}
              <div className="mt-10 bg-light-gray/60 border border-border-gray/30 rounded-2xl p-6 space-y-4">
                <div className="border-b border-border-gray/50 flex space-x-5 text-xs font-display font-semibold">
                  <button
                    onClick={() => setActiveTab('desc')}
                    className={`pb-2.5 transition-all relative cursor-pointer ${
                      activeTab === 'desc' ? 'text-primary' : 'text-gray-400 hover:text-dark'
                    }`}
                  >
                    Details
                    {activeTab === 'desc' && (
                      <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
                    )}
                  </button>
                  <button
                    onClick={() => setActiveTab('ingredients')}
                    className={`pb-2.5 transition-all relative cursor-pointer ${
                      activeTab === 'ingredients' ? 'text-primary' : 'text-gray-400 hover:text-dark'
                    }`}
                  >
                    Active Ingredients
                    {activeTab === 'ingredients' && (
                      <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
                    )}
                  </button>
                  <button
                    onClick={() => setActiveTab('benefits')}
                    className={`pb-2.5 transition-all relative cursor-pointer ${
                      activeTab === 'benefits' ? 'text-primary' : 'text-gray-400 hover:text-dark'
                    }`}
                  >
                    Benefits
                    {activeTab === 'benefits' && (
                      <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
                    )}
                  </button>
                  <button
                    onClick={() => setActiveTab('shipping')}
                    className={`pb-2.5 transition-all relative cursor-pointer ${
                      activeTab === 'shipping' ? 'text-primary' : 'text-gray-400 hover:text-dark'
                    }`}
                  >
                    Delivery
                    {activeTab === 'shipping' && (
                      <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
                    )}
                  </button>
                </div>

                <div className="text-xs sm:text-sm text-gray-600 font-sans leading-relaxed min-h-[90px] pt-1">
                  {activeTab === 'desc' && <p>{product.description}</p>}
                  {activeTab === 'ingredients' && (
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {product.ingredients?.map((ing) => (
                        <li key={ing} className="flex items-center gap-2 font-medium text-dark/90">
                          <Check size={13} className="text-secondary" />
                          <span>{ing}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                  {activeTab === 'benefits' && (
                    <ul className="space-y-1.5">
                      {product.benefits?.map((ben) => (
                        <li key={ben} className="flex items-start gap-2">
                          <Check size={13} className="text-secondary mt-0.5" />
                          <span>{ben}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                  {activeTab === 'shipping' && (
                    <p>
                      Your order will be packed in 100% recyclable, glass-first bottles and carbon-neutral outer packaging. Express shipping takes 2-4 business days. Complimentry delivery applies on all bags exceeding $75.
                    </p>
                  )}
                </div>
              </div>

            </div>
          </div>

          {/* Similar Products Recommendation row */}
          <div className="border-t border-border-gray/60 pt-16 mt-16">
            <div className="mb-8">
              <h3 className="font-display font-semibold text-2xl text-dark tracking-tight">
                Recommended For You
              </h3>
              <p className="text-gray-500 text-xs sm:text-sm font-sans mt-1">
                Formulations that complement your active skincare regimen.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {displaySimilar.map((item) => {
                const itemWishlisted = isInWishlist(item.id);
                return (
                  <div
                    key={item.id}
                    className="group flex flex-col h-full bg-white relative text-left"
                  >
                    {/* Image Frame */}
                    <div className="relative aspect-[4/5] rounded-2xl overflow-hidden bg-light-gray mb-4 border border-border-gray/30">
                      
                      {/* Discount/New Badges */}
                      <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5 animate-fade-in-up">
                        {item.discount && (
                          <span className="bg-primary text-white text-[10px] font-display font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-sm">
                            -{item.discount}%
                          </span>
                        )}
                        {item.isNew && (
                          <span className="bg-secondary text-white text-[10px] font-display font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-sm">
                            New
                          </span>
                        )}
                      </div>

                      {/* Wishlist Icon */}
                      <button
                        onClick={() => {
                          toggleWishlist(item);
                          toast.success(
                            itemWishlisted ? 'Removed from wishlist' : 'Added to wishlist!'
                          );
                        }}
                        className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-white/80 hover:bg-white text-dark hover:text-red-500 shadow-md flex items-center justify-center transition-all duration-300 focus:outline-none cursor-pointer"
                        aria-label="Add to Wishlist"
                      >
                        <Heart
                          size={16}
                          className="transition-transform duration-300 active:scale-125"
                          fill={itemWishlisted ? '#EF4444' : 'none'}
                          color={itemWishlisted ? '#EF4444' : 'currentColor'}
                        />
                      </button>

                      {/* Hover Image Switcher */}
                      <Link
                        to={`/product/${item.id}`}
                        className="block w-full h-full cursor-pointer"
                      >
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover object-center absolute inset-0 transition-opacity duration-700 group-hover:opacity-0"
                        />
                        <img
                          src={item.hoverImage}
                          alt={`${item.name} alternate view`}
                          className="w-full h-full object-cover object-center absolute inset-0 opacity-0 transition-opacity duration-700 group-hover:opacity-100"
                        />
                      </Link>

                      {/* Quick Add Overlay */}
                      <div className="absolute inset-x-0 bottom-4 px-4 translate-y-6 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 z-10">
                        <Button
                          onClick={() => {
                            addToCart(item, 1, '50ml');
                            setIsCartOpen(true);
                            toast.success(`${item.name} added to bag.`);
                          }}
                          variant="primary"
                          size="sm"
                          className="w-full shadow-lg"
                          leftIcon={<ShoppingBag size={14} />}
                        >
                          Add to Bag
                        </Button>
                      </div>
                    </div>

                    {/* Product Details */}
                    <div className="flex flex-col flex-grow">
                      <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1 font-display">
                        {item.category}
                      </span>
                      
                      <h4 className="font-display font-semibold text-sm sm:text-base text-dark hover:text-primary transition-colors mb-1.5">
                        <Link
                          to={`/product/${item.id}`}
                          className="cursor-pointer"
                        >
                          {item.name}
                        </Link>
                      </h4>
                      
                      {/* Rating */}
                      <div className="flex items-center gap-1 mb-2">
                        <div className="flex text-yellow-400">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              size={12}
                              fill={i < Math.floor(item.rating) ? 'currentColor' : 'none'}
                              className="stroke-1.5"
                            />
                          ))}
                        </div>
                        <span className="text-[10px] font-sans text-gray-500 font-medium pt-0.5">
                          {item.rating} ({item.reviewsCount})
                        </span>
                      </div>

                      {/* Price Tag */}
                      <div className="flex items-center gap-2 mt-auto">
                        <span className="font-display font-bold text-dark text-sm sm:text-base">
                          ${item.price.toFixed(2)}
                        </span>
                        {item.oldPrice && (
                          <span className="font-display font-medium text-gray-400 text-xs sm:text-sm line-through">
                            ${item.oldPrice.toFixed(2)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </Container>
      </main>

      <WhatsAppButton />
      <Footer />
    </>
  );
};

export default ProductDetail;
