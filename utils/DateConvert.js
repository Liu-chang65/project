const changeDatePattern = (currenDate) => {
    const months = [
      'JAN',
      'FEB',
      'MAR',
      'APR',
      'MAY',
      'JUN',
      'JUL',
      'AUG',
      'SEP',
      'OCT',
      'NOV',
      'DEC',
    ];
    let convertedDate = new Date(currenDate);
    let addedZeroDate = convertedDate.getDate() < 10? "0" +  convertedDate.getDate(): convertedDate.getDate();
    let addedZeroMonth = convertedDate.getMonth() < 10? "0" +  convertedDate.getMonth(): convertedDate.getMonth();
    let addedZeroFullYear = convertedDate.getFullYear() < 10? "0" +  convertedDate.getFullYear(): convertedDate.getFullYear();
    let addedZeroHours = convertedDate.getHours() < 10? "0" +  convertedDate.getHours(): convertedDate.getHours();
    let addedZeroMinutes = convertedDate.getMinutes() < 10? "0" +  convertedDate.getMinutes(): convertedDate.getMinutes();
    let addedZeroSeconds = convertedDate.getSeconds() < 10? "0" +  convertedDate.getSeconds(): convertedDate.getSeconds();

    let formattedDate =
    addedZeroDate +
      '-' +
      addedZeroMonth +
      '-' +
      addedZeroFullYear +
      ' ' +
      addedZeroHours +
      ':' +
      addedZeroMinutes +
      ':' +
      addedZeroSeconds;
    return formattedDate;
  };

  export default changeDatePattern