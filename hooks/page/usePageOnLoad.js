import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import _ from 'lodash';
import axios from '../../lib/axios';

const usePageOnLoad = ({ settings, currentBranch }) => {
  const dispatch = useDispatch();

  dispatch({
    type: 'ADD_SETTINGS',
    payload: {
      settings,
    },
  });

  dispatch({
    type: 'SET_CURRENT_BRANCH',
    payload: {
      branch: currentBranch,
    },
  });

  useEffect(() => {
    if (!currentBranch.contentWidgets) return;

    if (_.isEmpty(currentBranch.applicationMedia)) return;

    let logo;

    logo = currentBranch.applicationMedia.filter(
      (media) => media.type === 'LOGO',
    )[0].blobLink;

    dispatch({
      type: 'SET_LOGO',
      payload: {
        logo,
      },
    });
  }, [currentBranch]);

  // set axios auth headers
};

export default usePageOnLoad;
