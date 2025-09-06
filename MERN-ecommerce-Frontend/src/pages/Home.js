import NavBar from "../features/navbar/Navbar";
import ProductList from "../features/product/components/ProductList";
import Footer from "../features/common/Footer";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { selectLoggedInUser } from "../features/auth/authSlice";
import { fetchHomeRecommendationsAsync, selectRecommendedFetchedForSession } from "../features/product/productSlice";

function Home() {
    const dispatch = useDispatch();
    const user = useSelector(selectLoggedInUser);
    const recFetched = useSelector(selectRecommendedFetchedForSession);

    // Fetch recommendations only once per browser session (sessionStorage-backed)
    useEffect(() => {
        if (user && !recFetched) {
            dispatch(fetchHomeRecommendationsAsync());
        }
    }, [dispatch, user, recFetched]);

    return (
        <div>
            <NavBar>
                <ProductList></ProductList>
            </NavBar>
            <Footer></Footer>
        </div>
    );
}

export default Home;