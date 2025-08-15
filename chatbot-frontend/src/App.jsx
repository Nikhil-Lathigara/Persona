import { useState } from 'react';
import { ChakraProvider } from '@chakra-ui/react';
import MentorSelection from './components/MentorSelection';
import Chat from './components/Chat';

function App() {
  const [selectedMentor, setSelectedMentor] = useState(null);

  const handleSelectMentor = (mentor) => {
    setSelectedMentor(mentor);
  };

  const handleBack = () => {
    setSelectedMentor(null);
  };

  return (
    <ChakraProvider>
      {selectedMentor ? (
        <Chat selectedMentor={selectedMentor} onBack={handleBack} />
      ) : (
        <MentorSelection onSelectMentor={handleSelectMentor} />
      )}
    </ChakraProvider>
  );
}

export default App;
