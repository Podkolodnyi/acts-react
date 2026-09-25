import {createBrowserRouter} from "react-router";
import {AuthLayout} from "./layouts/AuthLayout.tsx";
import {ProtectedLayout} from "./layouts/ProtectedLayout.tsx";
import {AppLayout} from "./layouts/AppLayout.tsx";
import {AdminLayout} from "./layouts/AdminLayout.tsx";
import {HomePage} from "./pages/HomePage.tsx";
import {EngineerSelectPage} from "./pages/EngineerSelectPage.tsx";
import {RegisterPage} from "./pages/RegisterPage.tsx";
import {AdminPendingPage} from "./pages/AdminPendingPage.tsx";
import {AdminEngineersPage} from "./pages/AdminEngineersPage.tsx";
import {ActsPage} from "./pages/ActsPage.tsx";
import {ActDetailsPage} from "./pages/ActDetailsPage.tsx";

export const router = createBrowserRouter([
    {
        element: <AuthLayout/>,
        children: [
            {
                path: "engineer",
                element: <EngineerSelectPage/>
            },
            {
                path: "engineer/register",
                element: <RegisterPage/>
            },
/*            {
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
                    {
                        element: <AdminLayout/>,
                        children: [
                            {
                                path: "admin/pending",
                                element: <AdminPendingPage/>
                            },
                            {
                                path: "admin/engineers",
                                element: <AdminEngineersPage/>
                            },
                        ],
                    },
                    {
                        path: "acts",
                        element: <ActsPage/>
                    },
                    {
                        path: "acts/:id",
                        element: <ActDetailsPage/>
                    },
/*                    {
                        path: "acts/new",
                        element: <ActFormPage />,
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