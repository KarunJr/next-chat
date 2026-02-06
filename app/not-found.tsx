import Link from "next/link";

export default function NotFound() {
    return (
        <div className="flex flex-col items-center justify-center h-screen space-y-2">
            <h1 className="text-3xl font-bold">This page isn't available</h1>
            <p className="text-gray-500 mt-2">The link you followed may be broken, or the page may have been removed.</p>

            <div className="my-5">
                <Link
                    className="bg-white/30 px-4 py-3 rounded-md shadow-xl cursor-pointer hover:bg-white/20 transition-colors duration-200 ease-in"
                    href={"/"}
                >
                    Return to Home
                </Link>
            </div>
        </div>
    );
}
