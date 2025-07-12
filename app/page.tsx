
// 'use client';

// import { useState } from 'react';

// export default function Home() {
//   const [inputValue, setInputValue] = useState('');
//   const [message, setMessage] = useState('');

//   const handleClick = () => {
//     if (inputValue.trim()) {
//       setMessage(`🧠 You said: ${inputValue}`);
//       setInputValue('');
//       console.log('OPENAI KEY:', process.env.OPENAI_API_KEY);
//     }
//   };

//   return (
//     <div className="flex flex-col items-center justify-center min-h-screen px-4 py-8 bg-gray-50">
//       <h1 className="text-2xl sm:text-3xl font-semibold text-gray-800 mb-6">
//         What's in your mind today?
//       </h1>

//       <div className="flex flex-col sm:flex-row items-center gap-4 w-full max-w-xl">
//         <input
//           type="text"
//           value={inputValue}
//           onChange={(e) => setInputValue(e.target.value)}
//           placeholder="Ask anything..."
//           className="flex-1 px-4 py-3 rounded-lg border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 text-base w-full"
//         />
//         <button
//           onClick={handleClick}
//           className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition w-full sm:w-auto"
//         >
//           Send
//         </button>
//       </div>

//       {message && (
//         <p className="mt-6 text-gray-700 text-lg">{message}</p>
//       )}
//     </div>
//   );
// }

'use client';

import { useState } from 'react';

export default function Home() {
  const [inputValue, setInputValue] = useState('');
  const [reply, setReply] = useState('');
  const [loading, setLoading] = useState(false);

  const [showPreview, setShowPreview] = useState(false);

  const gitpodURL = 'https://3000-shahinshopo-aicodegener-b9mhy5foikf.ws-us120.gitpod.io/';

  const handleClick = async () => {
    if (!inputValue.trim()) return;

    setLoading(true);
    setReply('');

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: inputValue }),
      });

      const data = await res.json();
      setReply(data.reply);
    } catch (err) {
      setReply('❌ Failed to fetch response.');
    } finally {
      setLoading(false);
      setInputValue('');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 py-8 bg-gray-50">
      <h1 className="text-2xl sm:text-3xl font-semibold text-gray-800 mb-6">
        What's in your mind today?
      </h1>

      <div className="flex flex-col sm:flex-row items-center gap-4 w-full max-w-xl">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Ask anything..."
          className="flex-1 px-4 py-3 rounded-lg border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 text-base w-full"
          onKeyDown={(e) => e.key === 'Enter' && handleClick()}
        />
        <button
          onClick={handleClick}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition w-full sm:w-auto"
          disabled={loading}
        >
          {loading ? 'Thinking...' : 'Send'}
        </button>
      </div>

      {reply && (
        <p className="mt-6 text-gray-700 text-lg whitespace-pre-line">{reply}</p>
      )}

      <button
        onClick={() => setShowPreview(true)}
        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
      >
        Show Preview
      </button>

      {showPreview && (
        <iframe
          src={gitpodURL}
          title="Gitpod IDE"
          width="100%"
          height="500"
          className="mt-6 border rounded-md shadow-lg"
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
        ></iframe>
      )}


    </div>
  );
}
