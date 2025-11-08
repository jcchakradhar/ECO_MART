import NavBar from "../features/navbar/Navbar";
import ProductList from "../features/product/components/ProductList";
import Footer from "../features/common/Footer";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useMemo } from "react";
import { selectLoggedInUser } from "../features/auth/authSlice";
import { selectUserInfo, fetchLoggedInUserAsync } from "../features/user/userSlice";
import { fetchHomeRecommendationsAsync, setShowRecommendations } from "../features/product/productSlice";

function Home() {
    const dispatch = useDispatch();
    const authUser = useSelector(selectLoggedInUser);
    const userInfo = useSelector(selectUserInfo);

    const userId = userInfo?.id || authUser?.id || null;

    useEffect(() => {
        if (!authUser?.id) return;
        dispatch(fetchLoggedInUserAsync());
    }, [dispatch, authUser?.id]);

    useEffect(() => {
        dispatch(setShowRecommendations(true));
    }, [dispatch]);

    const profileSignature = useMemo(() => {
        if (!userInfo) return null;
        const weights = userInfo?.weights || {};
        const purchaseKey = Array.isArray(userInfo?.purchase_history)
            ? userInfo.purchase_history.join('|')
            : '';
        const searchKey = Array.isArray(userInfo?.searchHistory)
            ? userInfo.searchHistory.join('|')
            : '';
        return JSON.stringify({
            carbon: Number(weights.carbon ?? 0).toFixed(6),
            water: Number(weights.water ?? 0).toFixed(6),
            rating: Number(weights.rating ?? 0).toFixed(6),
            tolerance: Number(userInfo?.price_tolerance ?? 0).toFixed(6),
            purchases: purchaseKey,
            searches: searchKey,
        });
    }, [userInfo]);

    useEffect(() => {
        if (!userId || !profileSignature) return;

        const thunk = dispatch(fetchHomeRecommendationsAsync(userId));
        thunk.unwrap?.().catch(() => { });

        return () => {
            if (typeof thunk.abort === 'function') {
                thunk.abort();
            }
        };
    }, [dispatch, userId, profileSignature]);

    return (
        <div>
            <NavBar>
                <ProductList forceRecommendations></ProductList>
            </NavBar>
            <Footer></Footer>
        </div>
    );
}

export default Home;