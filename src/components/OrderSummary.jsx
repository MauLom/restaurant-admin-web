import React from 'react';
import { Box, VStack, HStack, Text, Button, Divider, IconButton,List, ListIcon, ListItem, Input} from '@chakra-ui/react';
import { FaTrashAlt, FaComment } from 'react-icons/fa';
import { Accordion, AccordionItem, AccordionButton, AccordionPanel, AccordionIcon} from '@chakra-ui/react'

function OrderSummary({ orderItems, total, setOrderComment, onRemoveItem, onSubmit }) {  
  return (
    <Box p={4} bg="gray.800" color="white" borderRadius="md" width="full">
      <Text fontSize="lg" mb={4}>Order Summary</Text>
      <VStack spacing={4} mb={4}>
        <Accordion defaultIndex={[0]} allowMultiple width='full'> 
          {orderItems.map(item => (
              <AccordionItem>
                <AccordionButton>
                    <HStack as='span' flex='1' textAlign='left' justifyContent='space-between'>
                      <Text>{item.name}</Text>
                      <Text>(x{item.quantity})</Text>
                      <Text>${(item.price * item.quantity).toFixed(2)}</Text>
                      <IconButton icon={<FaTrashAlt />} size="sm" 
                      onClick={() => onRemoveItem(item.itemId)} />
                    </HStack>
                  <AccordionIcon />
                </AccordionButton>
                <AccordionPanel pl={10} pt={0}>
                  <HStack>
                    <List>
                      {item.comments.map((comment, index) => (
                        <ListItem key={index}>
                          <Text fontSize='md'>{item.name}</Text>
                          <Text fontSize='xs' pl={5}><ListIcon as={FaComment} />{comment}</Text>
                        </ListItem>
                      ))}
                    </List>
                  </HStack>
                </AccordionPanel>
              </AccordionItem>
          ))}
        </Accordion>
      </VStack>
      <Divider mb={4} />
      <HStack justifyContent="space-between">
        <Text>Total</Text>
        <Text>$ {total.toFixed(2)}</Text>
      </HStack>
      <HStack mt={4} spacing={4} width='full' height={50}>
        <Button colorScheme="blue" onClick={onSubmit} flex={3} height='full'>
          <Text textAlign='center' whiteSpace='normal'>Submit Order</Text>
        </Button>
        <Input placeholder='Add general comment' flex={7} height='full' onChange={(e) => setOrderComment(e.target.value)}/>
      </HStack>
    </Box>
  );
}

export default OrderSummary;
