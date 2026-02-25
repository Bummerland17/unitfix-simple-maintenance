CREATE POLICY "Landlords can delete own requests"
ON public.maintenance_requests
FOR DELETE
USING (EXISTS (
  SELECT 1 FROM units u JOIN properties p ON u.property_id = p.id
  WHERE u.id = maintenance_requests.unit_id AND p.landlord_id = auth.uid()
));