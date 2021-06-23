/* eslint-disable no-param-reassign */
import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import _ from 'lodash';
import { setSelectedToppings } from '../../../store/actions/cart.actions';
import ToppingCard from './ToppingCard';

const ChoicesSection = ({ choiceGroup, setIsValid }) => {
  const dispatch = useDispatch();
  const { t } = useTranslation(['common']);
  const {
    id: groupId,
    choiceItems,
    customerMustSelectChoice,
    minSelection,
    maxSelection,
    inMeal,
  } = choiceGroup;
  const { selectedProductChoices } = useSelector((state) => state.cart);

  const [errorMessage, setErrorMessage] = useState('');
  const showErrorMessage = (message) => {
    setErrorMessage(message);
    // setTimeout(() => {
    //   setErrorMessage('');
    // }, 5000);
  };

  const boundSetSelectedToppings = (toppings) =>
    dispatch(setSelectedToppings(toppings));

  const isChoiceAdded = (choice) => {
    let alreadyAdded = false;
    selectedProductChoices.forEach((selectedChoice) => {
      if (selectedChoice.id === choice.id) {
        alreadyAdded = true;
      }
    });
    return alreadyAdded;
  };

  const handleAddClick = (choice) => {
    const _choice = _.clone(choice);
    const alreadyAdded = isChoiceAdded(choice);
    if (!alreadyAdded) {
      // is not added
      _choice.quantity = 1;
      _choice.choiceGroupId = groupId;
      boundSetSelectedToppings(selectedProductChoices.concat([_choice]));
    } else {
      // is added
      boundSetSelectedToppings(
        selectedProductChoices.map((selectedChoice) => {
          if (selectedChoice.id === _choice.id) {
            selectedChoice.quantity += 1;
          }
          return selectedChoice;
        }),
      );
    }
  };

  const handleRemoveClick = (choice) => {
    // quantity equals 1, we remove it
    const alreadyAdded = isChoiceAdded(choice);
    if (!alreadyAdded) return choice;

    const addedChoice = selectedProductChoices.filter(
      (selectedChoice) => selectedChoice.id === choice.id,
    )[0];
    if (addedChoice.quantity === 1) {
      boundSetSelectedToppings(
        selectedProductChoices.filter(
          (selectedChoice) => selectedChoice.id !== choice.id,
        ),
      );
      return choice;
    }
    // has quantity more than 1, so we just decrease it
    boundSetSelectedToppings(
      selectedProductChoices.map((selectedChoice) => {
        if (selectedChoice.id === choice.id) {
          selectedChoice.quantity -= 1;
        }
        return selectedChoice;
      }),
    );
    return choice;
  };

  const validate = () => {
    let isValid = true;
    // customer needs to select at least one item
    if (customerMustSelectChoice) {
      // Pelo menos um item da lista está aqui?
      const atLeastOneProduct = selectedProductChoices.some((element) =>
        choiceItems.map((choice) => choice.id).includes(element.id),
      );
      if (!atLeastOneProduct) {
        isValid = false;
        showErrorMessage(t('select_at_least_one_choice'));
        setIsValid(prev => ({ ...prev, [groupId]: false }));
        return isValid;
      }
    }
    let totalSelected = 0;
    selectedProductChoices.forEach((selectedChoice) => {
      choiceItems.forEach((choiceItem) => {
        if (selectedChoice.id === choiceItem.id) {
          totalSelected += selectedChoice.quantity;
        }
      });
    });
    if (minSelection > totalSelected && minSelection !== 0) {
      isValid = false;
      showErrorMessage(`${t('select_at_least')} ${minSelection}`);
      setIsValid(prev => ({ ...prev, [groupId]: false }));
      return isValid;
    }
    if (maxSelection < totalSelected && maxSelection !== 0) {
      isValid = false;
      showErrorMessage(`${t('select_at_max')} ${maxSelection}`);
      setIsValid(prev => ({ ...prev, [groupId]: false }));
      return isValid;
    }
    showErrorMessage('');
    setIsValid(prev => ({ ...prev, [groupId]: isValid }));
    return isValid;
  };

  useEffect(() => {
    validate();
  }, [selectedProductChoices]);

  return (
    <div className="row">
      {errorMessage !== '' && (
        <div className="col-12">
          <div className="alert alert-danger">{errorMessage}</div>
        </div>
      )}
      {choiceItems.map((choiceItem) => {
        return (
          <div key={choiceItem.id} className="col-md-6 col-6">
            <ToppingCard
              topping={choiceItem}
              onAdd={() => handleAddClick(choiceItem)}
              onRemove={() => handleRemoveClick(choiceItem)}
              isSelected={isChoiceAdded(choiceItem)}
              inMeal={inMeal}
            />
          </div>
        );
      })}
    </div>
  );
};

export default ChoicesSection;
