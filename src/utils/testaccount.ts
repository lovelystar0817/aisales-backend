export const TEST_ACCOUNT_REGEX = /^(.*\+.*@hupo\.co|.*\+test.*)$/;
// export const NON_TEST_ACCOUNT_REGEX = /$/; // for temporarily disabling test account filtering
export const NON_TEST_ACCOUNT_REGEX = /^(?!.*@hupo\.co$).+$/;
