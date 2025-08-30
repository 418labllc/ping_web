import React, { useState } from 'react';
import { Platform, Button } from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import ReactDatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css'; // Import the CSS for the web picker

// Helper function to format date as 'DD/MM/YYYY'
const formatDate = (date) => {
  const d = new Date(date);
  return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
};

// Mobile Date Picker for iOS/Android
const MobileDatePicker = ({ value, onChange }) => {
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);

  const showDatePicker = () => setDatePickerVisibility(true);
  const hideDatePicker = () => setDatePickerVisibility(false);

  const handleConfirm = (date) => {
    onChange(date.toISOString());
    hideDatePicker();
  };

  return (
    <>
      <Button
        title={value ? formatDate(value) : 'Select Date'}
        onPress={showDatePicker}
      />
      <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode="date"
        date={value ? new Date(value) : new Date()}
        onConfirm={handleConfirm}
        onCancel={hideDatePicker}
      />
    </>
  );
};

// Web Date Picker using react-datepicker with higher zIndex
const WebDatePicker = ({ value, onChange }) => {
  return (
    <div style={{ zIndex: 9999, position: 'relative' }}>
      <ReactDatePicker
        selected={value ? new Date(value) : null}
        onChange={(date) => onChange(date ? date.toISOString() : null)} // Handle clearing date
        dateFormat="MM/dd/yyyy"
        isClearable
        popperPlacement="auto" // Ensures the picker is positioned correctly
        popperModifiers={{
          preventOverflow: {
            enabled: true,
            boundariesElement: 'viewport',
          },
        }}
        style={{ zIndex: 9999 }} // Ensures higher z-index for the popper
      />
    </div>
  );
};

// Cross-platform date picker component
const CrossPlatformDatePicker = ({ value, onChange }) => {
  if (Platform.OS === 'web') {
    return <WebDatePicker value={value} onChange={onChange} />;
  }
  return <MobileDatePicker value={value} onChange={onChange} />;
};

export default CrossPlatformDatePicker;
