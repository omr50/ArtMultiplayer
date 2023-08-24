import { BrowserRouter, Route, Routes} from 'react-router-dom'
import { ReactNode, useState } from 'react'
import NavigationBar from './NavBar/NavBarComponent';
import WelcomeComponent from './Welcome/Welcome';
import { useTheme } from '../contexts/ThemeContext';
import MultiplayerGame from './MultiplayerGame.tsx/MultiplayerGame';
interface elementProp {
}

const AppStructure = () => {

    interface ChildProp {
        changeComp: ((newComp: React.ReactNode, type: String) => void) | null;
        closeComp: () => void;
    }
    // const [component, setComponent] = useState<React.ReactNode>(<LoginOptions changeComp={changeComponent} closeForm={closeComp}/>)
    const [componentType, setComponentType] = useState<String>('LoginOption')
    const [signup, setSignup] = useState<boolean>(false)

    function changeComponent(newComponent: React.ReactNode, type: String) {
        // setComponent(newComponent)
        setComponentType(type)
      }
    
    function closeComp() {
        setSignup(!signup);
    }

    return (
        <div className=''>
        {/* <AuthProvider> */}
            <BrowserRouter>
                <NavigationBar changeComp={changeComponent} closeorOpenForm={closeComp} formIsOpen={signup}/>
                <Routes>
                        <Route path='' element={<WelcomeComponent/>}/>
                        <Route path='/multiplayer' element={<MultiplayerGame/>}/>
                        {/* <Route path='/signup' element={<SignupComponent changeComp={changeComponent} closeForm={closeComp}/>}/> */}
                </Routes>
                {/* <FooterComponent/> */}
            </BrowserRouter>
        {/* </AuthProvider> */}
        </div>
    )
}











export default AppStructure;