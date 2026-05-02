// import React, { useState, useEffect } from 'react';
// import { Link } from 'react-router-dom';
// import { Trash2 } from 'lucide-react';
// import { fetchCart, removeFromCart, enrollInCourse } from '../../api/student.api';
// import './Cart.css';

// const Cart = () => {
//     const [items, setItems] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState(null);

//     const loadCart = async () => {
//         try {
//             const response = await fetchCart();
//             if (response.success) {
//                 setItems(response.data);
//             }
//         } catch (err) {
//             console.error('Failed to load cart', err);
//             setError('Could not load cart');
//         } finally {
//             setLoading(false);
//         }
//     };

//     useEffect(() => {
//         loadCart();
//     }, []);

//     const handleRemove = async (courseId) => {
//         try {
//             await removeFromCart(courseId);
//             setItems(items.filter(item => item._id !== courseId));
//         } catch (err) {
//             console.error('Failed to remove item', err);
//         }
//     };

//     const handleEnroll = async (courseId) => {
//         try {a
//             await enrollInCourse(courseId);
//             // Remove from cart local state after enrollment implies it moved to enrolled courses
//             setItems(items.filter(item => item._id !== courseId));
//             alert('Successfully enrolled!');
//         } catch (err) {
//             console.error('Failed to enroll', err);
//             alert('Failed to enroll. Please try again.');
//         }
//     };

//     if (loading) return <div className="cart-container">Loading cart...</div>;

//     return (
//         <div className="cart-container">
//             <h1>Your Cart</h1>
//             {items.length === 0 ? (
//                 <div className="empty-cart">
//                     <p>Your cart is empty.</p>
//                     <Link to="/" className="btn-browse">Browse Courses</Link>
//                 </div>
//             ) : (
//                 <div className="cart-items">
//                     {items.map(item => (
//                         <div key={item._id} className="cart-item">
//                             <img src={item.thumbnail} alt={item.name} className="cart-item-img" />
//                             <div className="cart-item-info">
//                                 <h3>{item.name}</h3>
//                                 <p>{item.instructor?.name}</p>
//                                 <span className="cart-price">{item.price === 0 ? 'Free' : `₹${item.price}`}</span>
//                             </div>
//                             <div className="cart-item-actions">
//                                 <button onClick={() => handleEnroll(item._id)} className="btn-enroll">Enroll Now</button>
//                                 <button onClick={() => handleRemove(item._id)} className="btn-remove">
//                                     <Trash2 size={20} />
//                                 </button>
//                             </div>
//                         </div>
//                     ))}
//                 </div>
//             )}
//         </div>
//     );
// };

// export default Cart;
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Trash2, AlertCircle } from 'lucide-react';
import { fetchCart, removeFromCart, enrollInCourse } from '../../api/student.api';
import { useToastContext } from '../../context/ToastContext';
import './Cart.css';

const Cart = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [processingId, setProcessingId] = useState(null);
    const { toast } = useToastContext();

    const loadCart = async () => {
        try {
            const response = await fetchCart();
            // Checking response.success based on your original code
            if (response && response.success) {
                setItems(response.data);
            } else {
                setItems(response || []); // Fallback just in case
            }
        } catch (err) {
            console.error('Failed to load cart', err);
            setError('We couldn\'t load your cart at this time. Please try refreshing the page.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadCart();
    }, []);

    const handleRemove = async (courseId) => {
        setProcessingId(courseId);
        try {
            await removeFromCart(courseId);
            setItems(prevItems => prevItems.filter(item => item._id !== courseId));
            toast.success('Item removed from cart.');
        } catch (err) {
            console.error('Failed to remove item', err);
            toast.error('Failed to remove item. Please try again.');
        } finally {
            setProcessingId(null);
        }
    };

    const handleEnroll = async (courseId) => {
        setProcessingId(courseId);
        try {
            await enrollInCourse(courseId);
            setItems(prevItems => prevItems.filter(item => item._id !== courseId));
            toast.success('Successfully enrolled! 🎉');
        } catch (err) {
            console.error('Failed to enroll', err);
            toast.error('Failed to enroll. Please try again.');
        } finally {
            setProcessingId(null);
        }
    };

    // Graceful fallback if the course thumbnail URL is broken
    const handleImageError = (e) => {
        e.target.src = 'https://placehold.co/120x80?text=No+Image'; 
        e.target.className = 'cart-item-img fallback';
    };

    if (loading) {
        return (
            <div className="cart-container loading-state">
                <p>Loading your cart...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="cart-container">
                <div className="error-container">
                    <AlertCircle size={40} className="error-icon" />
                    <h2>Oops!</h2>
                    <p>{error}</p>
                    <button onClick={loadCart} className="btn-browse">Try Again</button>
                </div>
            </div>
        );
    }

    return (
        <div className="cart-container">
            <h1>Your Cart</h1>

            {items.length === 0 ? (
                <div className="empty-cart">
                    <p>Your cart is empty.</p>
                    <Link to="/" className="btn-browse">Browse Courses</Link>
                </div>
            ) : (
                <div className="cart-items">
                    {items.map(item => {
                        const isProcessing = processingId === item._id;
                        
                        return (
                            <div key={item._id} className={`cart-item ${isProcessing ? 'processing' : ''}`}>
                                <img 
                                    src={item.thumbnail} 
                                    alt={`Thumbnail for ${item.name}`} 
                                    className="cart-item-img"
                                    onError={handleImageError}
                                />
                                <div className="cart-item-info">
                                    <h3>{item.name}</h3>
                                    {/* Added fallback text in case instructor is missing */}
                                    <p>{item.instructor?.name || 'Unknown Instructor'}</p>
                                    <span className="cart-price">{item.price === 0 ? 'Free' : `₹${item.price}`}</span>
                                </div>
                                <div className="cart-item-actions">
                                    <button 
                                        onClick={() => handleEnroll(item._id)} 
                                        className="btn-enroll"
                                        disabled={isProcessing}
                                        aria-label={`Enroll in ${item.name}`}
                                    >
                                        {isProcessing ? 'Processing...' : 'Enroll Now'}
                                    </button>
                                    <button 
                                        onClick={() => handleRemove(item._id)} 
                                        className="btn-remove"
                                        disabled={isProcessing}
                                        aria-label={`Remove ${item.name} from cart`}
                                    >
                                        <Trash2 size={20} />
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default Cart;