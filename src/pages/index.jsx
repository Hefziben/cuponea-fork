import Layout from "./Layout.jsx";

import Home from "./Home";

import CouponDetail from "./CouponDetail";

import Profile from "./Profile";

import Saved from "./Saved";

import CreateCoupon from "./CreateCoupon";

import Business from "./Business";

import Categories from "./Categories";

import ClaimCoupon from "./ClaimCoupon";

import Welcome from "./Welcome";

import BusinessSetup from "./BusinessSetup";

import SelectPlan from "./SelectPlan";

import Payment from "./Payment";

import Games from "./Games";

import VerifyCoupon from "./VerifyCoupon";

import NearbyOffers from "./NearbyOffers";

import CuponeadorSignup from "./CuponeadorSignup";

import CuponeadorDashboard from "./CuponeadorDashboard";

import VerifyCode from "./VerifyCode";

import CuponeadorProspecting from "./CuponeadorProspecting";

import CuponeadorSalesCoach from "./CuponeadorSalesCoach";

import CuponeadorClientPayment from "./CuponeadorClientPayment";

import VideoCouponFeed from "./VideoCouponFeed";

import CreateVideoCoupon from "./CreateVideoCoupon";

import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';

const PAGES = {
    
    Home: Home,
    
    CouponDetail: CouponDetail,
    
    Profile: Profile,
    
    Saved: Saved,
    
    CreateCoupon: CreateCoupon,
    
    Business: Business,
    
    Categories: Categories,
    
    ClaimCoupon: ClaimCoupon,
    
    Welcome: Welcome,
    
    BusinessSetup: BusinessSetup,
    
    SelectPlan: SelectPlan,
    
    Payment: Payment,
    
    Games: Games,
    
    VerifyCoupon: VerifyCoupon,
    
    NearbyOffers: NearbyOffers,
    
    CuponeadorSignup: CuponeadorSignup,
    
    CuponeadorDashboard: CuponeadorDashboard,
    
    VerifyCode: VerifyCode,
    
    CuponeadorProspecting: CuponeadorProspecting,
    
    CuponeadorSalesCoach: CuponeadorSalesCoach,
    
    CuponeadorClientPayment: CuponeadorClientPayment,
    
    VideoCouponFeed: VideoCouponFeed,
    
    CreateVideoCoupon: CreateVideoCoupon,
    
}

function _getCurrentPage(url) {
    if (url.endsWith('/')) {
        url = url.slice(0, -1);
    }
    let urlLastPart = url.split('/').pop();
    if (urlLastPart.includes('?')) {
        urlLastPart = urlLastPart.split('?')[0];
    }

    const pageName = Object.keys(PAGES).find(page => page.toLowerCase() === urlLastPart.toLowerCase());
    return pageName || Object.keys(PAGES)[0];
}

// Create a wrapper component that uses useLocation inside the Router context
function PagesContent() {
    const location = useLocation();
    const currentPage = _getCurrentPage(location.pathname);
    
    return (
        <Layout currentPageName={currentPage}>
            <Routes>            
                
                    <Route path="/" element={<Home />} />
                
                
                <Route path="/Home" element={<Home />} />
                
                <Route path="/CouponDetail" element={<CouponDetail />} />
                
                <Route path="/Profile" element={<Profile />} />
                
                <Route path="/Saved" element={<Saved />} />
                
                <Route path="/CreateCoupon" element={<CreateCoupon />} />
                
                <Route path="/Business" element={<Business />} />
                
                <Route path="/Categories" element={<Categories />} />
                
                <Route path="/ClaimCoupon" element={<ClaimCoupon />} />
                
                <Route path="/Welcome" element={<Welcome />} />
                
                <Route path="/BusinessSetup" element={<BusinessSetup />} />
                
                <Route path="/SelectPlan" element={<SelectPlan />} />
                
                <Route path="/Payment" element={<Payment />} />
                
                <Route path="/Games" element={<Games />} />
                
                <Route path="/VerifyCoupon" element={<VerifyCoupon />} />
                
                <Route path="/NearbyOffers" element={<NearbyOffers />} />
                
                <Route path="/CuponeadorSignup" element={<CuponeadorSignup />} />
                
                <Route path="/CuponeadorDashboard" element={<CuponeadorDashboard />} />
                
                <Route path="/VerifyCode" element={<VerifyCode />} />
                
                <Route path="/CuponeadorProspecting" element={<CuponeadorProspecting />} />
                
                <Route path="/CuponeadorSalesCoach" element={<CuponeadorSalesCoach />} />
                
                <Route path="/CuponeadorClientPayment" element={<CuponeadorClientPayment />} />
                
                <Route path="/VideoCouponFeed" element={<VideoCouponFeed />} />
                
                <Route path="/CreateVideoCoupon" element={<CreateVideoCoupon />} />
                
            </Routes>
        </Layout>
    );
}

export default function Pages() {
    return (
        <Router>
            <PagesContent />
        </Router>
    );
}