import NavBar from "../features/navbar/Navbar";
import ProductList from "../features/product/components/ProductList";
import Footer from "../features/common/Footer";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { setShowRecommendations, clearRecommendations } from "../features/product/productSlice";

function ProductsPage() {
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(setShowRecommendations(false));
        dispatch(clearRecommendations());
    }, [dispatch]);

    return (
        <div>
            <NavBar>
                <ProductList forceCatalog />
            </NavBar>
            <Footer />
        </div>
    );
}

export default ProductsPage;
