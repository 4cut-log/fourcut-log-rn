import {createNavigationContainerRef, CommonActions} from '@react-navigation/native';
import {RootStackParamList} from '@type/navigation';

export const navigationRef = createNavigationContainerRef<RootStackParamList>();

export function navigateToAuth() {
  if (navigationRef.isReady()) {
    navigationRef.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{name: 'Auth'}],
      }),
    );
  }
}
