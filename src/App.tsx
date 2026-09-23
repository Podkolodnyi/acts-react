import {RouterProvider} from "react-router";
import {router} from "./router.tsx";
import {SessionProvider} from "./session/SessionContext.tsx";

export default function App() {
    return (
        <SessionProvider>
            <RouterProvider router={router}/>
        </SessionProvider>
    );
}