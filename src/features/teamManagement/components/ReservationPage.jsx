import React from 'react';
import { Box, Grid } from '@chakra-ui/react';
import TableStatus from './TableStatus';
import ReservationForm from './ReservationForm';

function ReservationPage() {
  return (
    <Box p={4}>
      <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={6}>
        <TableStatus />
        <ReservationForm />
      </Grid>
    </Box>
  );
}

export default ReservationPage;
