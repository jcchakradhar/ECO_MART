import NavBar from "../features/navbar/Navbar";
import ProductDetail from "../features/product/components/ProductDetail";
import Footer from "../features/common/Footer";

function ProductDetailPage() {
    return (
        <div>
            <NavBar showHeader={false}>
                <ProductDetail />
            </NavBar>
            <Footer />
        </div>
    );
}

export default ProductDetailPage;