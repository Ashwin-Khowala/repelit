import AppBar from "@/components/AppBar"

export default function Layout({children}:{
    children: React.ReactNode
}){
    return (
        <div className="flex ">
            <AppBar />
            <div>
                {children}
            </div>
        </div>
    )
}