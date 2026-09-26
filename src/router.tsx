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
import {ActFormPage} from "./pages/ActFormPage.tsx";
import {DevicesPage} from "./pages/DevicesPage.tsx";
import {DevicePage} from "./pages/DevicePage.tsx";
import {IntraserviceDevicePage} from "./pages/IntraserviceDevicePage.tsx";
import {AdminDeletedActsPage} from "./pages/AdminDeletedActsPage.tsx";
import {AdminDevicesPage} from "./pages/AdminDevicesPage.tsx";
import {AdminActVersionsPage} from "./pages/AdminActVersionsPage.tsx";
import {AdminActVersionPage} from "./pages/AdminActVersionPage.tsx";

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
                            {
                                path: "admin/deleted-acts",
                                element: <AdminDeletedActsPage/>
                            },
                            {
                                path: "admin/devices",
                                element: <AdminDevicesPage/>
                            },
                            {
                                path: "admin/act-versions",
                                element: <AdminActVersionsPage/>
                            },
                            {
                                path: "admin/act-versions/:id",
                                element: <AdminActVersionPage/>
                            },
                        ],
                    },
                    {
                        path: "acts",
                        element: <ActsPage/>
                    },
                    {
                        path: "devices",
                        element: <DevicesPage/>
                    },
                    {
                        path: "devices/:id",
                        element: <DevicePage/>
                    },
                    {
                        path: "devices/intraservice/:taskId",
                        element: <IntraserviceDevicePage/>
                    },
                    {
                        path: "acts/:id",
                        element: <ActDetailsPage/>
                    },
                    {
                        path: "acts/new",
                        element: <ActFormPage mode="new"/>
                    },
                    {
                        path: "acts/new-thermo",
                        element: <ActFormPage mode="new-thermo"/>
                    },
                    {
                        path: "acts/:id/edit",
                        element: <ActFormPage mode="edit"/>
                    },
                    {
                        path: "acts/:id/repair",
                        element: <ActFormPage mode="repair"/>
                    },
/*                    {
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