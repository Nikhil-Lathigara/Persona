const mentors = [
  {
    id: 'hitesh',
    name: 'Hitesh Choudhary',
    image: 'https://avatars.githubusercontent.com/u/11613311',
    description: 'Tech educator, YouTuber, and founder of Chai aur Code. Expert in JavaScript, Web Development, and System Design.',
  },
  {
    id: 'piyush',
    name: 'Piyush Garg',
    image: 'https://imgs.search.brave.com/9Yi72Ga4tYbYmuW4I6DqoEp0bjink7fl7EAA4vNECa8/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly93c3J2/Lm5sLz91cmw9aHR0/cHM6Ly9jcmVhdG9y/LWFzc2V0cy5jb2Rl/ZGFtbi5jb20vcGl5/dXNoZ2FyZzEtNjMy/MDcxMmIwYWJjMWQw/MDA5M2E5NzczL3By/b2ZpbGUtcGljdHVy/ZS8yMDIyLTEwLTI5/LzRjZmE5N2IzZTFj/OWNlMWE3MDJjODhl/MTI2ZWRmOTA5Nzlm/MWNjZTAmdz0zMDgm/Zml0PWNvdmVyJmg9/MzA4JnE9ODImb3V0/cHV0PXdlYnA',
    description: 'Software Engineer and Tech Educator. Specializes in System Design, React, and Backend Development.',
  },
];

const MentorSelection = ({ onSelectMentor }) => {
  return (
    <div className="fixed inset-0 bg-gradient-to-b from-gray-900 to-black text-white overflow-y-auto">
      <div className="max-w-4xl mx-auto px-4 py-8 h-full flex flex-col">
        <div className="text-center mb-8 bg-black/40 p-6 rounded-xl backdrop-blur-sm border border-white/10">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent mb-2">
            Choose Your Tech Mentor
          </h1>
          <p className="text-white/60">
            Select a mentor to start your tech journey
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1 scrollbar-custom">
          {mentors.map((mentor) => (
            <div
              key={mentor.id}
              onClick={() => onSelectMentor(mentor)}
              className="group bg-black/40 backdrop-blur-sm border border-white/10 rounded-xl p-6
                cursor-pointer transition-all duration-300 hover:-translate-y-2
                hover:bg-black/60 hover:border-orange-500/50"
            >
              <div className="flex flex-col items-center space-y-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-red-400 rounded-full blur-xl opacity-0 group-hover:opacity-20 transition-opacity"></div>
                  <img
                    src={mentor.image}
                    alt={mentor.name}
                    className="w-32 h-32 md:w-40 md:h-40 rounded-full object-cover border-2 border-orange-400
                      group-hover:border-4 group-hover:border-orange-500 transition-all duration-300"
                  />
                </div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
                  {mentor.name}
                </h2>
                <p className="text-center text-white/80 leading-relaxed">
                  {mentor.description}
                </p>
                <div className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="px-4 py-2 rounded-lg bg-gradient-to-r from-orange-400 to-red-400 text-white text-sm">
                    Start Chat
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MentorSelection;
