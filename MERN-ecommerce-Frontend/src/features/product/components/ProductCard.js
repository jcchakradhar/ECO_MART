import React from 'react';
import { Link } from 'react-router-dom';
import { StarIcon } from '@heroicons/react/20/solid';

export default function ProductCard({ product }) {
    if (!product) return null;

    const id = product.id;
    const title = product.title || 'Product';
    const imageSrc = product.imgUrl || product.thumbnail || 'https://via.placeholder.com/500x625';
    const rating = Number(product.rating) || 0;
    const price = Number(product.price) || 0;
    const discountPrice = Number(product.discountPrice) || price;
    const discountPercentage = Number(product.discountPercentage) || 0;
    const stock = Number(product.stock);

    return (
        <Link to={`/product-detail/${id}`} className="group h-full">
            <div className="flex flex-col h-full bg-gradient-to-br from-white via-green-50 to-amber-50 border border-emerald-100 rounded-lg shadow hover:shadow-lg transition-shadow duration-200 overflow-hidden">
                {/* Image */}
                <div className="relative w-full aspect-[4/5] bg-white flex items-center justify-center overflow-hidden">
                    <img
                        src={imageSrc}
                        alt={title}
                        className="h-full w-full object-contain p-2 transition-transform duration-200 group-hover:scale-105"
                        loading="lazy"
                    />

                    {/* Side-by-side compact rating icons (transparent wrapper) */}
                    {(product.Eco_Rating || product.Water_Rating) && (
                        <div className="absolute top-2 left-2">
                            <div className="flex items-center gap-2">
                                {product.Eco_Rating && (
                                    <div
                                        className="w-12 h-16 rounded-md bg-gradient-to-b from-emerald-500 to-emerald-600 flex flex-col items-center justify-start pt-1 text-white shadow"
                                        title={`Eco ${product.Eco_Rating}`}
                                    >
                                        <span className="text-sm leading-none" role="img" aria-label="eco">🍃</span>
                                        <span className="text-sm font-extrabold leading-none mt-1">{product.Eco_Rating}</span>
                                    </div>
                                )}
                                {product.Water_Rating && (
                                    <div
                                        className="w-12 h-16 rounded-md bg-gradient-to-b from-sky-500 to-sky-600 flex flex-col items-center justify-start pt-1 text-white shadow"
                                        title={`Water ${product.Water_Rating}`}
                                    >
                                        <span className="text-sm leading-none" role="img" aria-label="water">💧</span>
                                        <span className="text-sm font-extrabold leading-none mt-1">{product.Water_Rating}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Discount Badge (optional) */}
                    {discountPercentage > 0 && (
                        <div className="absolute top-2 right-2">
                            <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-red-600 text-white">
                                -{discountPercentage}%
                            </span>
                        </div>
                    )}
                </div>

                {/* Info */}
                <div className="p-4 flex flex-col flex-1">
                    <h3 className="text-sm font-medium text-gray-900 line-clamp-2 mb-1">{title}</h3>
                    <div className="flex items-center mb-1">
                        {[...Array(5)].map((_, i) => (
                            <StarIcon
                                key={i}
                                className={`h-4 w-4 ${i < Math.floor(rating) ? 'text-yellow-400' : 'text-gray-200'}`}
                            />
                        ))}
                        <span className="ml-1 text-xs text-gray-600">{rating}</span>
                    </div>
                    <div className="flex items-center space-x-2 mb-1">
                        <span className="text-lg font-bold text-emerald-800">${discountPrice}</span>
                        {price !== discountPrice && (
                            <span className="text-sm text-gray-500 line-through">${price}</span>
                        )}
                    </div>
                    {Number.isFinite(stock) && (
                        stock <= 0 ? (
                            <p className="text-xs text-red-600 font-medium">Out of stock</p>
                        ) : stock <= 5 ? (
                            <p className="text-xs text-orange-600 font-medium">Only {stock} left</p>
                        ) : (
                            <p className="text-xs text-green-600 font-medium">In stock</p>
                        )
                    )}
                    <p className="text-xs text-gray-500 mt-auto">FREE delivery</p>
                </div>
            </div>
        </Link>
    );
}

