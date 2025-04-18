import Link from "next/link";
import Image from "next/image";

export default function Home() {
	return (
		<div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-indigo-900 to-purple-900 text-white">
			<div className="max-w-3xl mx-auto text-center px-4">
				<h1 className="text-5xl font-bold mb-6">Anime Recommender</h1>

				<div className="relative w-40 h-40 mx-auto mb-8">
					<Image src="/logo/sap-logo.png" alt="Anime Recommender Logo" fill className="object-contain" priority />
				</div>

				<p className="text-xl mb-8">
					Discover your next favorite anime based on your MyAnimeList profile! Our recommendation system analyzes your watching history and
					preferences to suggest anime titles you&apos;ll love.
				</p>

				<div className="space-y-6">
					<p className="text-lg">Ready to find your next binge-worthy series?</p>

					<Link
						href="/login"
						className="inline-block bg-pink-600 hover:bg-pink-700 text-white font-bold py-3 px-8 rounded-full transition duration-300 transform hover:scale-105">
						Get Your Recommendations
					</Link>

					<p className="text-sm mt-6 opacity-80">You&apos;ll need to connect your MyAnimeList account to get personalized recommendations</p>
				</div>
			</div>
		</div>
	);
}
