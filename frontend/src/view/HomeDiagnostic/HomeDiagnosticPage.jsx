import Nav from "../Components/Nav";
import "../../Style/HomeDiagnosticCSS/HomeDiagnosticPlanPage.css"
import { useEffect } from "react";
function HomeDiagnostic(){

    useEffect(() => {
      document.title = "MediGo | Diagnostic";
    }, []);
    
    return (
        <div>
            <Nav/>
            <h1>Hello this is Home Diagnostic Page Page</h1>
        </div>
        
    );
}

export default HomeDiagnostic;