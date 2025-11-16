export default function PatientsPage() {
    const patients = [
        {
          name: "John Cruz",
          age: 34,
          gender: "Male",
          condition: "Atopic dermatitis",
          img: "/john.png", // replace with actual URL, or remove for gray avatar
        },
        {
          name: "Maria Lopez",
          age: 28,
          gender: "Female",
          condition: "Acne vulgaris",
          img: null,
        },
        {
          name: "Ana Reyes",
          age: 23,
          gender: "Female",
          condition: "Rosacea",
          img: null,
        },
        {
          name: "Paul Tomas",
          age: 23,
          gender: "Female",
          condition: "Skin Allergy",
          img: null,
        },
        {
          name: "Carl Ramos",
          age: 46,
          gender: "Male",
          condition: "Hives",
          img: null,
        },
      ];
    
    return (
        <div className="p-6">
            <h1 className="text-2xl font-semibold mb-6">Patients</h1>
            {/* Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {patients.map((p, idx) => (
                <div
                key={idx}
                className="bg-white rounded-xl shadow-sm p-5 flex flex-col items-center text-center"
                >
                {/* Image or placeholder */}
                {p.img ? (
                    <img
                    src={p.img}
                    alt={p.name}
                    className="w-24 h-24 rounded-full object-cover mb-3"
                    />
                ) : (
                    <div className="w-24 h-24 bg-gray-300 rounded-full mb-3"></div>
                )}

                {/* Name */}
                <p className="font-semibold text-lg">{p.name}</p>

                <div className="mt-1 text-sm text-gray-700">
                    <span className="font-medium">{p.age}</span> •{" "}
                    <span>{p.gender}</span>
                </div>

                {/* Condition */}
                <p className="mt-1 text-sm text-gray-500">{p.condition}</p>

                {/* View Button */}
                <button className="mt-4 w-full bg-teal-600 hover:bg-teal-700 text-white py-1.5 rounded-md text-sm">
                    View
                </button>
                </div>
            ))}
            </div> 
        </div>
    )
}