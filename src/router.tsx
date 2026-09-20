import {createBrowserRouter} from "react-router";
import {AuthLayout} from "./layouts/AuthLayout.tsx";
import {ProtectedLayout} from "./layouts/ProtectedLayout.tsx";
import {AppLayout} from "./layouts/AppLayout.tsx";
import {HomePage} from "./pages/HomePage.tsx";

export const router = createBrowserRouter([
    {
        element: <AuthLayout/>,
        children: [
/*            {
                path: "login",
                element: <LoginPage/>
            },
            {
                path: "forgot-password",
                element: <ForgotPasswordPage/>
            }*/
        ]
    },
    {
        element: <ProtectedLayout/>,
        children: [
            {
                element: <AppLayout/>,
                children: [
                    {
                        index: true,
                        element: <HomePage/>
                    },
/*                    {
                        path: "acts",
                        element: <ActsPage />,
                    },
                    {
                        path: "acts/new",
                        element: <ActFormPage />,
                    },
                    {
                        path: "acts/:id",
                        element: <ActDetailsPage />,
                    },
                    {
                        path: "settings",
                        element: <SettingsPage />,
                    },*/
                ],
            },
        ],
    },
/*    {
        path: "*",
        element: <NotFoundPage />,
    },*/
])