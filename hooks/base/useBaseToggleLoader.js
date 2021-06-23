import { useEffect, useState } from 'react';
import Logger from '../../lib/logger';

const useBaseToggleLoader = () => {
    const [isLoading, setIsLoading] = useState(false);

    const toggleLoader = () => {
        Logger.log('toggle', isLoading);
        setIsLoading(!isLoading);
    }

    return [isLoading,
        toggleLoader]
}

export default useBaseToggleLoader;
