import { LoaderCircle } from 'lucide-react'

export default function Loading() {
    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex flex-col gap-4 items-center justify-center">
            <div className="text-3xl font-bold text-center text-white">
                Loading...
            </div>
            <LoaderCircle className="text-white size-24 animate-spin" />
        </div>
    )
} 