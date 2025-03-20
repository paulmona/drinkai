import React from 'react';
import { Box, Typography } from '@mui/material';
import { LocalBar as BarIcon } from '@mui/icons-material';

export default function Logo() {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        color: 'inherit',
        textDecoration: 'none',
      }}
    >
      <BarIcon sx={{ fontSize: 32 }} />
      <Typography
        variant="h6"
        component="div"
        sx={{
          fontWeight: 700,
          letterSpacing: '0.5px',
        }}
      >
        Drink AI
      </Typography>
    </Box>
  );
} 