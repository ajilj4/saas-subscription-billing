const Landing = () => (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
            <h1 className="text-5xl font-bold text-gray-900 mb-4">SaaS Billing App</h1>
            <p className="text-xl text-gray-600 mb-8">Professional Subscription Solutions</p>
            <div className="space-x-4">
                <a href="/login" className="px-6 py-2 bg-blue-600 text-white rounded-lg">Login</a>
                <a href="/signup" className="px-6 py-2 border border-blue-600 text-blue-600 rounded-lg">Signup</a>
            </div>
        </div>
    </div>
);

export default Landing;
