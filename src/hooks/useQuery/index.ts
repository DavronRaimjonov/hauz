import { useQuery } from "@tanstack/react-query";
import { useAxios } from "../useAxios";

interface QueryHandlerType {
  url: string;
  pathname: string;
  param?: object;
}
export const useQueryHandler = ({ url, pathname, param }: QueryHandlerType) => {
  const axios = useAxios();
  return useQuery({
    queryKey: [pathname],
    queryFn: () => axios({ url, param }),
  });
};
