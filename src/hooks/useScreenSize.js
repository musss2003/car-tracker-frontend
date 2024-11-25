import { useState, useEffect } from 'react';

const useScreenSize = (query) => {
    const [matches, setMatches] = useState(window.matchMedia(query).matches);

    useEffect(() => {
        const media = window.matchMedia(query);
        const handleChange = () => setMatches(media.matches);

        media.addEventListener('change', handleChange);
        return () => media.removeEventListener('change', handleChange);
    }, [query]);

    return matches;
};

export default useScreenSize;
