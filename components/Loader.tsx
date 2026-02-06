import { Loader2Icon } from "lucide-react"

interface LoaderProps {
    loading: boolean
}
export default function Loader({ loading }: LoaderProps) {
    return loading && (
        <div className="absolute inset-0 z-10 h-full flex items-center justify-center">
            <Loader2Icon className="animate-spin h-8 w-8" />
        </div>
    )
}