import { Outlet } from 'react-router-dom';

// project imports
import Customization from '../Customization';

// ==============================|| MINIMAL LAYOUT ||============================== //

const MinimalLayout = () => (
    <>
        <div className='zugzwang-mini-layout-container'>
            <Outlet />
        </div>
    </>
);

export default MinimalLayout;
